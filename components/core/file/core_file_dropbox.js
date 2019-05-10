COMPONENT.define("CoreFileDropbox", {
    config: {
        protocol: /^dropbox:\/\//,
        platform: "server"
    },
    init: function (me) {
        require("es6-promise").polyfill();
        me.fs = require("fs");
        me.https = require("https");
        const accessToken = JSON.parse(me.fs.readFileSync("private/dropbox.json"))["access-token"];
        const fetch = require("isomorphic-fetch");
        const dropbox = require("dropbox").Dropbox;
        me.dropbox = new dropbox({ accessToken, fetch });
    },
    read: async function (options) {
        const me = this;
        var result = await me.dropbox.filesGetTemporaryLink({ path: this.path });
        var body = "";
        return new Promise((resolve, reject) => {
            me.https.get(result.link, res => {
                if (options.path) {
                    res.pipe(me.fs.createWriteStream(options.path));
                }
                else {
                    res.on("data", function (chunk) {
                        body += chunk;
                    });
                }
                res.on("close", function () {
                    resolve(body);
                });
                res.on("error", function (e) {
                    reject(e);
                });
            });
        });
    },
    write: async function (data, options) {
        const me = this;
        var response = null;
        if (options.path) {
            const fileSize = me.fs.statSync(options.path).size;
            var cursor = { session_id: null, offset: 0 };
            var chunkSize = 8 * 1000 * 1000;
            const openFile = me.util.promisify(me.fs.open);
            const readFile = me.util.promisify(me.fs.read);
            const closeFile = me.util.promisify(me.fs.close);
            const buffer = new Buffer(chunkSize);
            const fd = openFile(options.path, "r");
            for (; ;) {
                const nread = readFile(fd, buffer, 0, chunkSize, null);
                if (nread === 0) {
                    closeFile(fd);
                }
                var contents = buffer;
                if (nread < chunkSize) {
                    contents = buffer.slice(0, nread);
                }
                if (options.progress) {
                    options.progress(cursor.offset, fileSize);
                }
                if (cursor.offset + contents.length >= fileSize) {
                    if (cursor.offset) {
                        var commit = { path: this.path, mode: "overwrite", mute: false };
                        await me.dropbox.filesUploadSessionFinish({ cursor, commit, contents });
                    }
                    else {
                        await me.dropbox.filesUpload({ path: this.path, contents });
                    }
                    return;
                }
                else if (cursor.offset) {
                    await me.dropbox.filesUploadSessionAppendV2({ cursor, close: false, contents });
                    cursor.offset += contents.length;
                }
                else {
                    await me.dropbox.filesUploadSessionStart({ close: false, contents });
                    cursor.session_id = response.session_id;
                    cursor.offset += contents.length;
                }
            }
        }
        else {
            response = await me.dropbox.filesUpload({ path: this.path, contents: data });
        }
        return response;
    },
    members: async function () {
        const me = this;
        const entries = [];
        var response = await me.dropbox.filesListFolder({ path: this._path });
        entries.push(...response.entries);
        while (response.has_more) {
            response = await me.dropbox.filesListFolderContinue({ cursor: response.cursor });
            entries.push(...response.entries);
        }
        return entries;
    },
    info: async function () {
        const me = this;
        var info = me.dropbox.filesGetMetadata({ path: this._path }) || {};
        return info;
    },
    isDirectory: async function () {
        return (await this.info())[".tag"] === "folder";
    },
    size: async function () {
        return (await this.info()).size;
    },
    exists: async function () {
        let exists = true;
        try {
            await this.info();
        }
        catch (err) {
            exists = false;
        }
        return exists;
    },
    makeDir: async function (options) {
        const me = this;
        var folderRef = await me.dropbox.filesCreateFolder({ path: this._path, autorename: false });
        return folderRef;
    }
});