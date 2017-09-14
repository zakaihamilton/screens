/*
    @author Zakai Hamilton
    @component CorePath
*/

package.core.path = function CorePath(me) {
    me.goto = function(oldPath, newPath) {
        var path = oldPath;
        var tokens = newPath.split("/");
        if(tokens) {
            if(newPath[0] === "/") {
                path = "";
            }
            for(let token of tokens) {
                if(!token) {
                    continue;
                }
                if(token === ".") {
                    continue;
                }
                if(token === "..") {
                    path = me.core.util.removeLast(path, "/");
                    continue;
                }
                if(path) {
                    path += "/";
                }
                path += token;
            }
        }
        if(!path) {
            path = ".";
        }
        return path;
    };
    me.fullName = function(path) {
        var name = "";
        var last = path.split("/").pop();
        if(last) {
            var name = last;
            var hidden = false;
            if(last.startsWith(".")) {
                name = name.substring(1);
                hidden = true;
            }
            if(hidden) {
                name = "." + name;
            }
        }
        return name;
    };
    me.name = function(path) {
        var name = "";
        var last = path.split("/").pop();
        if(last) {
            var name = last;
            var hidden = false;
            if(last.startsWith(".")) {
                name = name.substring(1);
                hidden = true;
            }
            var period = name.lastIndexOf(".");
            if(period !== -1) {
                name = name.substr(0, period);
            }
            if(hidden) {
                name = "." + name;
            }
        }
        return name;
    };
    me.extension = function(path) {
        var extension = "";
        var last = path.split("/").pop();
        if(last) {
            var name = last;
            if(last.startsWith(".")) {
                name = name.substring(1);
            }
            var period = name.lastIndexOf(".");
            if(period !== -1) {
                extension = name.substr(period+1);
            }
        }
        return extension;
    };
};