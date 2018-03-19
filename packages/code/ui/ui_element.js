/*
 @author Zakai Hamilton
 @component UIElement
 */

package.ui.element = function UIElement(me) {
    me.init = function() {
        me.apply = me.createElements;
    };
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = Object.keys(me.components).map(function (component_name) {
            if(!(component_name.includes("widget."))) {
                return null;
            }
            var component = package(component_name);
            var depends = component.dependencies;
            if (depends) {
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
            return package(target).dependencies.properties.length - package(source).dependencies.properties.length;
        });
        if(!matches.length) {
            return null;
        }
        var match = matches[0];
        if (with_parent_dependency) {
            for (var match_index = 0; match_index < matches.length; match_index++) {
                if (package(matches[match_index]).dependencies.parent) {
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
    me.find = function(object, name) {
        var member = null;
        while(object) {
            if(object.component) {
                var component = package(object.component);
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
    me.createElements = function (properties, parent, context=null, params=null) {
        if(typeof properties === "string") {
            properties = me.core.property.get(parent, properties, context, params);
        }
        if (Array.isArray(properties)) {
            properties.map(function (item) {
                me.createElements(item, parent, context, params);
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
        var object = null;
        var component_name = properties["ui.element.component"];
        var tag = properties['ui.basic.tag'];
        if (!tag && !component_name) {
            component_name = me.matches(properties, parent);
        }
        if(!component_name) {
            component_name = "ui.element";
        }
        var component = package(component_name);
        var defaultProperties = component.properties;
        me.core.console.log("creating element of " + component_name);
        if(!tag && defaultProperties && 'ui.basic.tag' in defaultProperties) {
            tag = defaultProperties['ui.basic.tag'];
        }
        if(!tag) {
            tag = "div";
        }
        object = document.createElement(tag);
        me.core.object(component, object);
        object.var = {};
            if(context === "self") {
            me.core.console.log("using self context");
            context = object;
        }
        object.context = context ? context : parent;
        if(params) {
            for(var key in params) {
                me.core.property.set(object, "ui.param." + key, params[key]);
            }
        }
        me.core.property.set(object, "ui.node.parent", parent);
        var constructor = component.create;
        if(constructor) {
            constructor(object, parent);
        }
        object.context = object;
        var redirect = component.redirect;
        if(redirect) {
            redirect.disabled = true;
        }
        if(defaultProperties) {
            for (var key in defaultProperties) {
                me.core.property.set(object, key, defaultProperties[key]);
            }
        }
        if(redirect) {
            redirect.disabled = false;
        }
        object.context = context ? context : parent;
        for (var key in properties) {
            me.core.property.set(object, key, properties[key]);
        }
        if (component.extend) {
            component.extend.map(function (extension) {
                me.core.property.set(object, extension + ".extend");
            });
        }
        if (component_name !== me.id) {
            me.core.property.set(object, "draw");
        }
        return object;
    };
};
