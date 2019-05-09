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
                res.on("data", function (chunk) {
                    body += chunk;
                });
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
        var response = await me.dropbox.filesUpload({ path: this.path, contents: data });
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