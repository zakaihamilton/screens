COMPONENT.define({
    name: "CoreFileNode",
    config: {
        protocol: /^file:\/\//,
        platform: "server"
    },
    init(me) {
        me.fs = require("fs");
        me.util = require("util");
    },
    async read(options) {
        const me = this;
        const readFile = me.util.promisify(me.fs.readFile);
        return await readFile(this.path, options);
    },
    async write(data, options) {
        const me = this;
        const writeFile = me.util.promisify(me.fs.writeFile);
        return await writeFile(this.path, data, options);
    },
    async members() {
        const me = this;
        const readdir = me.util.promisify(me.fs.readdir);
        return await readdir(this.path);
    },
    async info() {
        const me = this;
        const stat = me.util.promisify(me.fs.stat);
        let info = await stat(this.path) || {};
        return info;
    },
    async isDirectory() {
        return (await this.info()).isDirectory();
    },
    async size() {
        return (await this.info()).size;
    },
    exists() {
        const me = this;
        const exists = me.fs.existsSync(this._path);
        return exists;
    },
    async makeDir(options) {
        const me = this;
        const mkdir = me.util.promisify(me.fs.mkdir);
        return await mkdir(this._path, options ? options.mode : 777);
    }
});