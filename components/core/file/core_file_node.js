COMPONENT.define("CoreFileNode", {
    config: {
        protocol: /^file:\\/,
        platform: "server"
    },
    init: function (me) {
        me.fs = require("fs");
        me.util = require("util");
    },
    read: async function (options) {
        const me = this;
        const readFile = me.util.promisify(me.fs.readFile);
        return await readFile(this.path, options);
    },
    write: async function (data, options) {
        const me = this;
        const writeFile = me.util.promisify(me.fs.writeFile);
        return await writeFile(this.path, data, options);
    },
    members: async function () {
        const me = this;
        const readdir = me.util.promisify(me.fs.readdir);
        return await readdir(this.path);
    },
    info: async function () {
        const me = this;
        const stat = me.util.promisify(me.fs.stat);
        let info = await stat(this.path) || {};
        return info;
    },
    isDirectory: async function () {
        return (await this.info()).isDirectory();
    },
    size: async function () {
        return (await this.info()).size;
    },
    exists: async function () {
        const me = this;
        const exists = me.fs.existsSync(this._path);
        return exists;
    },
    makeDir: async function (options) {
        const me = this;
        const mkdir = me.util.promisify(me.fs.mkdir);
        return await mkdir(this._path, options ? options.mode : 777);
    }
});