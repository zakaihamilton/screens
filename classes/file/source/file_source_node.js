class FileSourceNode extends component.CoreFileSource {
    static init(id) {
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
}

component.register({ FileSourceNode });