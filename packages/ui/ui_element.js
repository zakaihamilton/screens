/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = package["widget"].components.map(function (component_name) {
            var component = package.path(component_name);
            var depends = component["ui.element.depends"];
            if (depends) {
                if (depends.parent) {
                    if (parent) {
                        var match = false;
                        for (var depend_index = 0; depend_index < depends.parent.length; depend_index++) {
                            if (me.package.ui.node.container(parent, depends.parent[depend_index])) {
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
            return package.path(target)["ui.element.depends"].properties.length - package.path(source)["ui.element.depends"].properties.length;
        });
        var match = matches[0];
        if (with_parent_dependency) {
            for (var match_index = 0; match_index < matches.length; match_index++) {
                if (package.path(matches[match_index])["ui.element.depends"].parent) {
                    match = matches[match_index];
                    break;
                }
            }
        }
        return match;
    };
    me.document = {
        get: function(object) {
            return document;
        }
    };
    me.body = {
        get: function(object) {
            return document.getElementsByTagName("body")[0];
        }
    };
    me.desktop = function() {
        if(document.body.var) {
            return document.body.var.desktop;
        }
        else {
            return document.body;
        }
    };
    me.bar = function() {
        if(document.body.var) {
            return document.body.var.desktop.var.bar;
        }
        else {
            return document.body;
        }
    };
    me.workspace = function() {
        if(document.body.var) {
            return document.body.var.desktop.var.workspace;
        }
        else {
            return document.body;
        }
    };
    me.update = function (properties, object) {
        if (Array.isArray(properties)) {
            properties.map(function (item) {
                me.update(item, object);
            });
            return;
        }
        for (var key in properties) {
            me.package.core.property.set(object, key, properties[key]);
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
        path = me.package.core.property.fullname(object, path, path);
        return path;
    };
    me.find = function(object, name) {
        var member = null;
        while(object) {
            if(object.component) {
                var component = package.path(object.component);
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
            properties = me.package.core.property.get(parent, properties, context);
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
        if (!parent || parent==="workspace") {
            parent = me.workspace();
        }
        if("ui.element.update" in properties) {
            var update = properties["ui.element.update"];
            for (var key in update) {
                me.package.core.property.set(parent, key, update[key]);
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
        var component = package.path(component_name);
        var defaultProperties = component["ui.element.default"];
        console.log("creating element of " + component_name);
        if(!tag && defaultProperties && 'ui.basic.tag' in defaultProperties) {
            tag = defaultProperties['ui.basic.tag'];
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
        me.package.core.object.attach(object, component);
        object.var = {};
            if(context === "self") {
            console.log("using self context");
            context = object;
        }
        object.context = context ? context : parent;
        me.package.core.property.set(object, "ui.node.parent", parent);
        if (component_name !== me.id) {
            me.package.core.property.set(object, "create", parent);
        }
        object.context = object;
        var redirect = component["core.property.redirect"];
        component["core.property.redirect"] = null;
        if(defaultProperties) {
            for (var key in defaultProperties) {
                me.package.core.property.set(object, key, defaultProperties[key]);
            }
        }
        component["core.property.redirect"] = redirect;
        object.context = context ? context : parent;
        for (var key in properties) {
            me.package.core.property.set(object, key, properties[key]);
        }
        if (component.extend) {
            component.extend.map(function (extension) {
                me.package.core.property.set(object, extension + ".extend");
            });
        }
        if (component_name !== me.id) {
            me.package.core.property.set(object, "draw");
        }
        return object;
    };
};
