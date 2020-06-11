/*
    @author Zakai Hamilton
    @component CorePath
*/

screens.core.path = function CorePath(me, { core }) {
    me.goto = function (oldPath, newPath) {
        var path = oldPath;
        if (!path) {
            path = ".";
        }
        var tokens = newPath.split("/");
        if (tokens) {
            if (newPath[0] === "/") {
                path = "";
            }
            for (let token of tokens) {
                if (!token) {
                    continue;
                }
                if (token === ".") {
                    continue;
                }
                if (token === "..") {
                    path = core.util.removeLast(path, "/");
                    continue;
                }
                if (path) {
                    path += "/";
                }
                path += token;
            }
        }
        if (!path) {
            path = ".";
        }
        return path;
    };
    me.folderPath = function (path) {
        path = path.split("/");
        path.pop();
        path = path.join("/");
        return path;
    };
    me.fullName = function (path) {
        var name = "";
        var last = path.split("/").pop();
        if (last) {
            name = last;
            var hidden = false;
            if (last.startsWith(".")) {
                name = name.substring(1);
                hidden = true;
            }
            if (hidden) {
                name = "." + name;
            }
        }
        return name;
    };
    me.fileName = function (path, withExtension) {
        var name = "";
        var last = path.split("/").pop();
        if (last) {
            name = last;
            var hidden = false;
            if (last.startsWith(".")) {
                name = name.substring(1);
                hidden = true;
            }
            var period = name.lastIndexOf(".");
            if (!withExtension && period !== -1) {
                name = name.substr(0, period);
            }
            if (hidden) {
                name = "." + name;
            }
        }
        return name;
    };
    me.extension = function (path) {
        var extension = "";
        if (path) {
            var last = path.split("/").pop();
            if (last) {
                var name = last;
                if (last.startsWith(".")) {
                    name = name.substring(1);
                }
                var period = name.lastIndexOf(".");
                if (period !== -1) {
                    extension = name.substr(period + 1);
                }
            }
        }
        return extension;
    };
    me.replaceExtension = function (path, extension) {
        if (!extension) {
            extension = "";
        }
        if (extension) {
            extension = "." + extension;
        }
        var currentExtension = me.extension(path);
        if (currentExtension) {
            path = path.replace("." + currentExtension, extension);
        }
        else {
            path += extension;
        }
        return path;
    };
    me.suffix = function (path, suffix) {
        if (!suffix) {
            suffix = "";
        }
        var currentExtension = me.extension(path);
        if (currentExtension) {
            path = path.replace("." + currentExtension, suffix + "." + currentExtension);
        }
        else {
            path += suffix;
        }
        return path;
    };
    me.normalize = function (...names) {
        return names.filter(name => name && name !== "/").map(name => {
            if (typeof name === "string") {
                if (name.startsWith("/")) {
                    name = name.substring(1);
                }
                if (name.endsWith("/")) {
                    name = name.substring(0, -1);
                }
            }
            return name;
        }).join("/");
    };
};