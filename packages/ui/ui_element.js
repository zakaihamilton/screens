/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.require = {platform:"browser"};
    me.type="div";
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = package["ui"].components.map(function (component_name) {
            component = package["ui." + component_name];
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
        var info = package.core.ref.gen_path(object, "parentNode");
        if (typeof me.root === "undefined") {
            me.root = info.root;
        }
        return info.path;
    };
    me.to_object = function (path) {
        var object = path;
        if (typeof path === "string") {
            object = package.core.ref.find_object(me.root, path, "childNodes");
        }
        return object;
    };
    me.get = function (object, path) {
        object = me.to_object(object);
        var method = path.substring(path.lastIndexOf(".") + 1)
        console.log("get path: " + path);
        var result = undefined;
        if (!path.startsWith("ui.element")) {
            result = package.core.message.send({method: "get", path: path, params: [object, method]});
        }
        if (typeof result === "undefined") {
            result = package.core.message.send({prefix: "get_", path: path, params: [object]});
        }
        if (typeof result === "undefined" && !method.includes(object.component)) {
            result = package.core.message.send({prefix: "get_", path: path, params: [object], component: object.component});
        }
        return result;
    };
    me.set = function (object, path, value) {
        var result = null;
        object = me.to_object(object);
        var method = path.substring(path.lastIndexOf(".") + 1)
        if (!path.startsWith("ui.element")) {
            result = package.core.message.send({method: "set", path: path, params: [object, method, value]});
        }
        if (!result) {
            result = package.core.message.send({prefix: "set_", path: path, params: [object, value]});
        }
        if (!result && !path.startsWith(object.component)) {
            result = package.core.message.send({prefix: "set_", path: path, params: [object, value], component: object.component});
        }
        return result;
    };
    me.body = function() {
        return document.getElementsByTagName("body")[0];
    };
    me.update = function (data, object) {
        if (Array.isArray(data)) {
            data.map(function (properties) {
                me.update_element(properties, object);
            });
        } else if(data) {
            return me.update_element(data, object);
        }
    };
    me.update_element = function (properties, object) {
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
    };
    me.create = function (data, parent) {
        if (Array.isArray(data)) {
            data.map(function (properties) {
                me.create_element(properties, parent);
            });
        } else if(data) {
            return me.create_element(data, parent);
        }
    };
    me.create_element = function (properties, parent) {
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
        object = document.createElement(component.type);
        object.properties = properties;
        object.component = component_name;
        if (!parent) {
            parent = me.body();
        }
        me.set(object, "ui.node.parent", parent);
        object.path = me.to_path(object);
        if(component.class) {
            package.ui.style.add_class(object, component.class);
        }
        if(component_name !== me.id) {
            package.core.message.send({component: component_name, method: "create", params: [object]});
        }
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
        if(component.extend) {
            for(var extensionIndex = 0; extensionIndex < component.extend.length; extensionIndex++) {
                package.core.message.send({component: component.extend[extensionIndex], method: "extend", params: [object]});
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
        return object.path;
    };
};
