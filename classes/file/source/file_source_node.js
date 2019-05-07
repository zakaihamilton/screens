class FileSourceNode extends component.CoreFileSource {
    static init(id) {
        component.CoreObject.init(id);
        const me = FileSourceNode;
        me.fs = require("fs");
        me.util = require("util");
        component.CoreFile.register("file", me);
    }
    static config() {
        return {
            platform: "server"
        };
    }
    constructor(file, path) {
        super(file, path);
    }
    async read(options) {
        const me = FileSourceNode;
        const readFile = me.util.promisify(me.fs.readFile);
        return await readFile(this._path, options);
    }
    async write(data, options) {
        const me = FileSourceNode;
        const writeFile = me.util.promisify(me.fs.writeFile);
        return await writeFile(this._path, data, options);
    }
    async members() {
        const me = FileSourceNode;
        const readdir = me.util.promisify(me.fs.readdir);
        return await readdir(this._path);
    }
    async info() {
        const me = FileSourceNode;
        const stat = me.util.promisify(me.fs.stat);
        let info = await stat(this._path);
        if (!info) {
            info = {};
        }
        return info;
    }
    async isDirectory() {
        return (await this.info()).isDirectory();
    }
    async size() {
        return (await this.info()).size;
    }
    async exists() {
        const me = FileSourceNode;
        const exists = me.fs.existsSync(this._path);
        return exists;
    }
    async makeDir() {
        const me = FileSourceNode;
        const mkdir = me.util.promisify(me.fs.mkdir);
        return await mkdir(this._path);
    }
}

component.register({ FileSourceNode });