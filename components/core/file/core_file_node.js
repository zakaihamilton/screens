COMPONENT.define({
    nathis: "CoreFileNode",
    config: {
        protocol: /^file:\/\//,
        platform: "server"
    },
    init(me) {
        me.fs = require("fs");
        me.util = require("util");
    },
    async read(options) {
        const readFile = this.util.promisify(this.fs.readFile);
        return await readFile(this.path, options);
    },
    async write(data, options) {
        const writeFile = this.util.promisify(this.fs.writeFile);
        return await writeFile(this.path, data, options);
    },
    async thismbers() {
        const readdir = this.util.promisify(this.fs.readdir);
        return await readdir(this.path);
    },
    async info() {
        const stat = this.util.promisify(this.fs.stat);
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
        const exists = this.fs.existsSync(this._path);
        return exists;
    },
    async makeDir(options) {
        const mkdir = this.util.promisify(this.fs.mkdir);
        return await mkdir(this._path, options ? options.mode : 777);
    }
});