/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = me["widget"].components.map(function (component_name) {
            var component = me[component_name];
            if (component.depends) {
                var depends = component.depends;
                if (depends.parent) {
                    if (parent) {
                        var match = false;
                        for (var depend_index = 0; depend_index < depends.parent.length; depend_index++) {
                            if (me.ui.node.container(parent, depends.parent[depend_index])) {
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
                if (depends.properties && properties) {
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
    me.body = function () {
        return document.getElementsByTagName("body")[0];
    };
    me.desktop = function() {
        return document.body;
    }
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
    me.to_full_name = function( object, path) {
        path = path.replace("@component", object.component);
        if(object.context) {
            object = object.context;
        }
        path = me.core.property.fullname(object, path, path);
        return path;
    };
    me.find = function(object, name) {
        var member = null;
        while(object) {
            if(object.component) {
                var component = me[object.component];
                if(name in component) {
                    member = component[name];
                }
            }
            object = object.parentNode;
        }
        return member;
    };
    me.component = {
        get: function(object) {
            return object.component;
        }
    };
    me.create = function (properties, parent, context=null) {
        if(typeof properties === "string") {
            properties = me.send(properties, parent, context);
        }
        if (Array.isArray(properties)) {
            properties.map(function (item) {
                me.create(item, parent, context);
            });
            return;
        }
        if(!properties) {
            return;
        }
        if(!Object.keys(properties).length) {
            return;
        }
        if (!parent || parent==="desktop") {
            parent = me.desktop();
        }
        if("ui.element.update" in properties) {
            var update = properties["ui.element.update"];
            for (var key in update) {
                me.set(parent, key, update[key]);
            }
            if(Object.keys(properties).length === 1) {
                return;
            }
        }
        var object = null;
        var component_name = properties["ui.element.component"];
        var tag = properties['ui.basic.tag'];
        if (!tag && !component_name) {
            component_name = me.matches(properties, parent);
        }
        if(!component_name) {
            component_name = "ui.element";
        }
        var component = me[component_name];
        console.log("creating element of " + component_name);
        if(!tag && component.default && 'ui.basic.tag' in component.default) {
            tag = component.default['ui.basic.tag'];
        }
        if(!tag) {
            tag = "div";
        }
        var creationMethod = me.find(parent, "createElement");
        if(creationMethod) {
            object = creationMethod(tag);
        }
        else {
            object = document.createElement(tag);
        }
        me.core.object.attach(object, component);
        object.var = {};
            if(context === "self") {
            console.log("using self context");
            context = object;
        }
        object.context = context ? context : parent;
        me.set(object, "ui.node.parent", parent);
        if (component_name !== me.id) {
            me.set(object, "create", parent);
        }
        object.context = object;
        var redirect = component.redirect;
        component.redirect = null;
        if(component.default) {
            for (var key in component.default) {
                me.set(object, key, component.default[key]);
            }
        }
        component.redirect = redirect;
        object.context = context ? context : parent;
        for (var key in properties) {
            me.set(object, key, properties[key]);
        }
        if (component.extend) {
            component.extend.map(function (extension) {
                me.set(object, extension + ".extend");
            });
        }
        object.context = null;
        if (component_name !== me.id) {
            me.set(object, "draw");
        }
        return object;
    };
};
