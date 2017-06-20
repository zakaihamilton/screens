/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.require = {platform: "browser"};
    me.default = {
        "ui.basic.tag": "div"
    };
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = me["widget"].components.map(function (component_name) {
            component = me[component_name];
            if (component.depends) {
                var depends = component.depends;
                if (depends.parent) {
                    if (parent) {
                        var match = false;
                        for (var depend_index = 0; depend_index < depends.parent.length; depend_index++) {
                            if (depends.parent[depend_index] === parent.component) {
                                match = true;
                            }
                        }
                        if (!match) {
                            return null;
                        }
                        with_parent_dependency = true;
                    } else {
                        return null;
                    }
                }
                if (depends.properties) {
                    for (var depend_index = 0; depend_index < depends.properties.length; depend_index++) {
                        if (!(depends.properties[depend_index] in properties)) {
                            return null;
                        }
                    }
                    return component.id;
                }
            }
            return null;
        });
        matches = matches.filter(Boolean);
        /* sort by dependencies */
        matches.sort(function (source, target) {
            return me[target].depends.properties.length - me[source].depends.properties.length;
        });
        var match = matches[0];
        if (with_parent_dependency) {
            for (var match_index = 0; match_index < matches.length; match_index++) {
                if (me[matches[match_index]].depends.parent) {
                    match = matches[match_index];
                    break;
                }
            }
        }
        return match;
    };
    me.to_path = function (object) {
        if (typeof object === "string") {
            return object;
        }
        var info = me.core.ref.path(object, "parentNode", "unique");
        if (typeof me.root === "undefined") {
            me.root = info.root;
        }
        if (me.to_object(info.path) !== object) {
            throw "Invalid path " + info.path + " for object";
        }
        return info.path;
    };
    me.to_object = function (path) {
        var object = path;
        if (typeof path === "string") {
            object = me.core.ref.object(me.root, path, "childNodes", "unique");
        }
        return object;
    };
    me.to_objects = function (path) {
        if (typeof path !== "string") {
            path = me.to_path(path);
        }
        objects = me.core.ref.objects(me.root, path, "childNodes", "unique");
        return objects;
    };
    me.method = function (object, path) {
        var method = "";
        if (object && object.component) {
            method = object.component + ".";
        }
        method += path;
        return method;
    };
    me.get_value = function(object, value) {
        if(typeof value === "string" && value.startsWith("@")) {
            var result = me.get(object, value);
            if(typeof result !== "undefined") {
                value = result;
            }
        }
        return value;
    };
    me.get = function (object, path) {
        var result = undefined;
        object = me.to_object(object);
        if (object) {
            var method = me.method(object, path);
            if (method.includes(".")) {
                result = me.send(method + ".get", object);
            }
        }
        return result;
    };
    me.set = function (object, path, value=null) {
        var result = undefined;
        object = me.to_object(object);
        if (object && (object.component || object === document.body)) {
            console.log("set object: " + object + " path: " + path + " value: " + value);
            var method = me.method(object, path);
            if (method.includes(".")) {
                result = me.send(method + ".set", object, value);
            }
        }
        return result;
    };
    me.broadcast = function (object, path, value=null) {
        me.set(object, path, value);
        object = me.to_object(object);
        if(object.childNodes) {
            for(var childIndex = 0; childIndex < object.childNodes.length; childIndex++) {
                me.broadcast(object.childNodes[childIndex], path, value);
            }
        }
    };
    me.parent = function (object, component_name) {
        var parent = object.parentNode;
        while (parent) {
            if (parent === document.body) {
                return null;
            }
            if (parent.component === component_name) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    };
    me.body = function () {
        return document.getElementsByTagName("body")[0];
    };
    me.update = function (properties, object) {
        if (Array.isArray(properties)) {
            properties.map(function (item) {
                me.update(item, object);
            });
            return;
        }
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
    };
    me.combine = function (maps) {
        var combined = {};
        var maps = Array.prototype.slice.call(arguments, 0);
        for (var mapIndex = 0; mapIndex < maps.length; mapIndex++) {
            var map = maps[mapIndex];
            if (map) {
                for (var key in map) {
                    combined[key] = map[key];
                }
            }
        }
        return combined;
    };
    me.create = function (properties, parent) {
        if (Array.isArray(properties)) {
            properties.map(function (item) {
                me.create(item, parent);
            });
            return;
        }
        var object = null;
        parent = me.to_object(parent);
        var component_name = properties["ui.element.component"];
        if (!component_name) {
            component_name = me.matches(properties, parent);
        }
        if (!component_name) {
            component_name = "ui.element";
        }
        var component = me[component_name];
        properties = me.combine(component.default, properties);
        console.log("creating element of " + component_name + " for properties: " + JSON.stringify(properties));
        object = document.createElement(properties['ui.basic.tag']);
        object.component = component_name;
        if (!parent) {
            parent = me.body();
        }
        me.set(object, "ui.node.parent", parent);
        var path = me.to_path(object);
        if (component.class) {
            me.ui.theme.set_class(object, component.class);
        }
        if (component_name !== me.id) {
            component.send(component.id + ".create", object);
        }
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
        if (component.extend) {
            component.extend.map(function (extension) {
                me.send(extension + ".extend", object);
            });
        }
        if (component_name !== me.id) {
            component.send(component.id + ".draw", object);
        }
        return path;
    };
};
