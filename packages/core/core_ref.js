/*
 @author Zakai Hamilton
 @component CoreId
 */

package.core.ref = new function() {
    this.current = 1000;
    this.gen = function() {
        this.current++;
        return "ref_" + this.current;
    };
    this.path = function(node, parent_method, property="id") {
        var path = "", name = "";
        var root = null;
        while(node) {
            root = node;
            if(typeof node[property] === "null" || typeof node[property] === "undefined" || node[property] === "") {
                node[property] = this.gen();
            }
            name = node[property];
            if(typeof node[parent_method] !== "undefined") {
                if(typeof node[parent_method] === "function") {
                    node = node[parent_method]();
                }
                else {
                    node = node[parent_method];
                }
            }
            else {
                node = null;
            }
            if(node) {
                if(path) {
                    path = name + "/" + path;
                }
                else {
                    path = name;
                }
            }
        }
        console.log("path: " + path + " root: " + root);
        return {path:path,root:root};
    };
    this.get = function(node, path, children_method, property="id") {
        if (path.includes("/")) {
            parts = path.split("/");
            var children = null, child = null, found = null;
            for (part_index = 0; part_index < parts.length; part_index++) {
                if(children_method) {
                    if(typeof node[children_method] !== "undefined") {
                        if(typeof node[children_method] === "function") {
                            children = node[children_method]();
                        }
                        else {
                            children = node[children_method];
                        }
                    }
                    else {
                        return null;
                    }
                    found = null;
                    for(var child_idx = 0; child_idx < children.length; child_idx++) {
                        child = children[child_idx];
                        if(child[property] === parts[part_index]) {
                            found = child;
                            break;
                        }
                    }
                    node = found;
                }
                else {
                    node = node[parts[part_index]];
                }
                if(node === null || typeof node === "undefined" || typeof node === "null") {
                    return null;
                }
            }
            return node;
        }
    };
};
