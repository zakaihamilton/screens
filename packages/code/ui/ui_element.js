/*
 @author Zakai Hamilton
 @component UIElement
 */

screens.ui.element = function UIElement(me, packages) {
    const { core } = packages;
    me.matches = function (properties, parent) {
        /* Find matching components */
        var with_parent_dependency = false;
        var matches = me.components.map(function (component_name) {
            if (!(component_name.includes("widget."))) {
                return null;
            }
            var component = screens.browse(component_name);
            if (!component || !component.element) {
                return null;
            }
            var depends = component.element.dependencies;
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
            return screens.browse(target).element.dependencies.properties.length -
                screens.browse(source).element.dependencies.properties.length;
        });
        if (!matches.length) {
            return null;
        }
        var match = matches[0];
        if (with_parent_dependency) {
            for (var match_index = 0; match_index < matches.length; match_index++) {
                if (screens.browse(matches[match_index]).element.dependencies.parent) {
                    match = matches[match_index];
                    break;
                }
            }
        }
        return match;
    };
    me.document = {
        get: function (object) {
            return document;
        }
    };
    me.body = {
        get: function (object) {
            return document.getElementsByTagName("body")[0];
        }
    };
    me.desktop = function () {
        if (document.body.var) {
            return document.body.var.desktop;
        }
        else {
            return document.body;
        }
    };
    me.bar = function () {
        if (document.body.var) {
            return document.body.var.desktop.var.bar;
        }
        else {
            return document.body;
        }
    };
    me.workspace = function () {
        if (document.body.var) {
            return document.body.var.desktop.var.workspace;
        }
        else {
            return document.body;
        }
    };
    me.combine = function (...maps) {
        var combined = {};
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
    me.find = function (object, name) {
        var member = null;
        while (object) {
            if (object.component) {
                var component = screens.browse(object.component);
                if (name in component) {
                    member = component[name];
                }
            }
            object = object.parentNode;
        }
        return member;
    };
    me.component = {
        get: function (object) {
            return object.component;
        }
    };
    me.create = function (properties, parent, context = null, params = null) {
        if (typeof properties === "string") {
            properties = core.property.get(parent, properties, context, params);
        }
        if (Array.isArray(properties)) {
            for (var item of properties) {
                me.create(item, parent, context, params);
            }
            return;
        }
        if (!properties) {
            return;
        }
        if (!Object.keys(properties).length) {
            return;
        }
        if (!parent || parent === "workspace") {
            parent = me.workspace();
        }
        var object = null;
        var component_name = properties["ui.element.component"];
        var tag = properties["ui.basic.tag"];
        if (!tag && !component_name) {
            component_name = me.matches(properties, parent);
        }
        if (!component_name) {
            component_name = "ui.element";
        }
        var component = screens.browse(component_name);
        if (!component) {
            throw "Cannot find component: " + component_name;
        }
        var defaultProperties = null;
        if (component.element) {
            defaultProperties = component.element.properties;
        }
        if (component.element && component.element.tag) {
            tag = component.element.tag(properties, parent, context, params);
        }
        if (!tag && defaultProperties && "ui.basic.tag" in defaultProperties) {
            tag = defaultProperties["ui.basic.tag"];
        }
        if (!tag) {
            tag = "div";
        }
        var exists = false;
        if (component.element && component.element.use) {
            object = component.element.use(properties, parent, context, params);
            if (object) {
                exists = true;
            }
        }
        if (!object) {
            object = document.createElement(tag);
            core.property.object.create(component, object);
        }
        object.var = {};
        if (context === "self") {
            context = object;
        }
        object.context = context ? context : parent;
        if (params) {
            for (var key in params) {
                core.property.set(object, "ui.param." + key, params[key]);
            }
        }
        if (component.element) {
            var container = component.element.container;
            if (container) {
                parent = container(object, parent, properties) || parent;
            }
        }
        if (parent && !exists) {
            core.property.set(object, "ui.node.parent", parent);
        }
        if (component.element) {
            var create = component.element.create;
            if (create) {
                create(object, parent);
            }
        }
        object.context = object;
        var redirect = null;
        if (component.element) {
            redirect = component.element.redirect;
            component.redirect = Object.assign({}, redirect, component.redirect);
            redirect = component.redirect;
            if (redirect) {
                redirect.disabled = true;
            }
        }
        if (defaultProperties) {
            for (let key in defaultProperties) {
                core.property.set(object, key, defaultProperties[key]);
            }
        }
        if (redirect) {
            redirect.disabled = false;
        }
        object.context = context ? context : parent;
        for (let key in properties) {
            core.property.set(object, key, properties[key]);
        }
        if (component.element && component.element.extend) {
            for (var extension of component.element.extend) {
                core.property.set(object, extension + ".extend");
            }
        }
        if (component.element) {
            var draw = component.element.draw;
            if (draw) {
                draw(object);
            }
        }
        return object;
    };
    return "browser";
};
