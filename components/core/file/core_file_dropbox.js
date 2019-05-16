COMPONENT.CoreFileDropbox = class CoreFileDropbox extends COMPONENT.CoreObject {
    static config() {
        return {
            protocol: /^dropbox:\/\//,
            platform: "server"
        };
    }
    static init(me) {
        require("es6-promise").polyfill();
        me.fs = require("fs");
        me.https = require("https");
        const accessToken = JSON.parse(me.fs.readFileSync("private/dropbox.json"))["access-token"];
        const fetch = require("isomorphic-fetch");
        const dropbox = require("dropbox").Dropbox;
        me.dropbox = new dropbox({ accessToken, fetch });
    }
    async read(options) {
        var result = await this.dropbox.filesGetTemporaryLink({ path: this.path });
        var body = "";
        return new Promise((resolve, reject) => {
            this.https.get(result.link, res => {
                if (options.path) {
                    res.pipe(this.fs.createWriteStream(options.path));
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
    }
    async write(data, options) {
        var response = null;
        if (options.path) {
            const fileSize = this.fs.statSync(options.path).size;
            var cursor = { session_id: null, offset: 0 };
            var chunkSize = 8 * 1000 * 1000;
            const openFile = this.util.promisify(this.fs.open);
            const readFile = this.util.promisify(this.fs.read);
            const closeFile = this.util.promisify(this.fs.close);
            const buffer = new Buffer(chunkSize);
            const fd = await openFile(options.path, "r");
            for (; ;) {
                const nread = await readFile(fd, buffer, 0, chunkSize, null);
                if (nread === 0) {
                    await closeFile(fd);
                    return;
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
                        await this.dropbox.filesUploadSessionFinish({ cursor, commit, contents });
                    }
                    else {
                        await this.dropbox.filesUpload({ path: this.path, contents });
                    }
                    return;
                }
                else if (cursor.offset) {
                    await this.dropbox.filesUploadSessionAppendV2({ cursor, close: false, contents });
                    cursor.offset += contents.length;
                }
                else {
                    await this.dropbox.filesUploadSessionStart({ close: false, contents });
                    cursor.session_id = response.session_id;
                    cursor.offset += contents.length;
                }
            }
        }
        else {
            response = await this.dropbox.filesUpload({ path: this.path, contents: data });
        }
        return response;
    }
    async members() {
        const entries = [];
        var response = await this.dropbox.filesListFolder({ path: this._path });
        entries.push(...response.entries);
        while (response.has_more) {
            response = await this.dropbox.filesListFolderContinue({ cursor: response.cursor });
            entries.push(...response.entries);
        }
        return entries;
    }
    async info() {
        var info = this.dropbox.filesGetthistadata({ path: this._path }) || {};
        return info;
    }
    async isDirectory() {
        return (await this.info())[".tag"] === "folder";
    }
    async size() {
        return (await this.info()).size;
    }
    async exists() {
        let exists = true;
        try {
            await this.info();
        }
        catch (err) {
            exists = false;
        }
        return exists;
    }
    async makeDir(options) {
        var folderRef = await this.dropbox.filesCreateFolder({ path: this._path, autorename: false });
        return folderRef;
    }
};