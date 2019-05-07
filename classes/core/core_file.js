class CoreFile extends component.CoreObject {
    static init(id) {
        CoreFile.sources = {};
    }
    constructor(path) {
        super();
        let source = null;
        const [prefix, subPath] = path.split("://");
        source = CoreFile.sources[prefix];
        this._path = subPath;
        this._source = new source(this, subPath);
    }
    static register(prefix, component) {
        CoreFile.sources[prefix] = component;
    }
    path() {
        return this._path;
    }
    async forward(method) {
        var args = Array.prototype.slice.call(arguments, 1);
        let result = null;
        if (this._source) {
            result = await this._source[method].apply(this._source, args);
        }
        return result;
    }
    async read(options) {
        return this.forward("read", options);
    }
    async write(data, options) {
        return this.forward("write", data, options);
    }
    async members() {
        return this.forward("members");
    }
    async isDirectory() {
        return this.forward("isDirectory");
    }
    async size() {
        return this.forward("size");
    }
    async exists() {
        return this.forward("exists");
    }
}

class CoreFileSource extends component.CoreObject {
    constructor(file, path) {
        super();
        this._file = file;
        this._path = path;
    }
    async read(options) {
        throw "read operation not supported";
    }
    async write(data, options) {
        throw "write operation not supported";
    }
    async members() {
        throw "members operation not supported";
    }
    async isDirectory() {
        throw "isDirectory operation not supported";
    }
    async size() {
        throw "size operation not supported";
    }
    async exists() {
        throw "exists operation not supported";
    }
}

component.register({ CoreFile, CoreFileSource });