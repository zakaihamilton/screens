/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.require = {platform:"browser"};
    me.tag_name="div";
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = package["widget"].components.map(function (component_name) {
            component = package["widget." + component_name];
            if (component.depends) {
                var depends = component.depends;
                if (depends.parent) {
                    if(parent) {
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
                    }
                    else {
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
            return package[target].depends.properties.length - package[source].depends.properties.length;
        });
        var match = matches[0];
        if(with_parent_dependency) {
            for(var match_index = 0; match_index < matches.length; match_index++) {
                if(package[matches[match_index]].depends.parent) {
                    match = matches[match_index];
                    break;
                }
            }
        }
        return match;
    };
    me.to_path = function (object) {
        var path = null;
        var info = me.core.ref.gen_path(object, "parentNode", "unique");
        if (typeof me.root === "undefined") {
            me.root = info.root;
        }
        return info.path;
    };
    me.to_object = function (path) {
        var object = path;
        if (typeof path === "string") {
            object = me.core.ref.find_object(me.root, path, "childNodes", "unique");
        }
        return object;
    };
    me.get = function (object, path) {
        var result = undefined;
        object = me.to_object(object);
        var method = path.substring(path.lastIndexOf(".") + 1)
        console.log("get path: " + path);
        if(object) {
            if (typeof result === "undefined") {
                result = me.core.message.send({prefix: "get_", path: path, params: [object]});
            }
            if (typeof result === "undefined" && !method.includes(object.component)) {
                result = me.core.message.send({prefix: "get_", path: path, params: [object], component: object.component});
            }
            if (typeof result === "undefined" && !path.startsWith("ui.element")) {
                result = me.core.message.send({method: "get", path: path, params: [object, method]});
            }
            if (typeof result === "undefined") {
                result = object[method];
            }
        }
        return result;
    };
    me.set = function (object, path, value) {
        var result = undefined;
        object = me.to_object(object);
        var method = path.substring(path.lastIndexOf(".") + 1)
        if(object) {
            if (typeof result === "undefined") {
                result = me.core.message.send({prefix: "set_", path: path, params: [object, value]});
            }
            if (typeof result === "undefined" && !path.startsWith(object.component)) {
                result = me.core.message.send({prefix: "set_", path: path, params: [object, value], component: object.component});
            }
            if (typeof result === "undefined" && !path.startsWith("ui.element")) {
                result = me.core.message.send({method: "set", path: path, params: [object, method, value]});
            }
            if (typeof result === "undefined") {
                console.log("setting value: " + value + " for method: " + method + " in object: " + object.id);
                result = object[method] = value;
            }
        }
        return result;
    };
    me.body = function() {
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
        if(!component_name) {
            component_name = me.matches(properties, parent);
        }
        if (!component_name) {
            component_name="ui.element";
        }
        console.log("creating element of " + component_name + " for properties: " + JSON.stringify(properties));
        var component = package[component_name];
        var tag_name = component.tag_name;
        if(properties['ui.element.tag_name']) {
            tag_name = properties['ui.element.tag_name'];
        }
        object = document.createElement(tag_name);
        object.properties = properties;
        object.component = component_name;
        if (!parent) {
            parent = me.body();
        }
        me.set(object, "ui.node.parent", parent);
        object.path = me.to_path(object);
        if(component.class) {
            me.ui.style.add_class(object, component.class);
        }
        if(component_name !== me.id) {
            component.send("create", object);
        }
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
        if(component.extend) {
            for(var extensionIndex = 0; extensionIndex < component.extend.length; extensionIndex++) {
                package[component.extend[extensionIndex]].send("extend", object);
            }
        }
        if(properties['ui.element.members']) {
            var content = object.content;
            if(!content) {
                content = object;
            }
            console.log("content: " + content);
            me.create(properties['ui.element.members'], content);
        }
        console.log("object.path: " + object.path);
        return object.path;
    };
};
