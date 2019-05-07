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
    read(options) {
        let result = null;
        if (this._source) {
            result = this._source.read(options);
        }
        return result;
    }
    write(data, options) {
        let result = null;
        if (this._source) {
            result = this._source.write(data, options);
        }
        return result;
    }
}

class CoreFileSource extends component.CoreObject {
    constructor(file, path) {
        super();
        this._file = file;
        this._path = path;
    }
    read(options) {

    }
    write(data, options) {

    }
}

component.register({ CoreFile, CoreFileSource });