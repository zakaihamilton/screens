/*
 @author Zakai Hamilton
 @component WidgetTitle
 */

package.widget.title = function WidgetTitle(me) {
    me.tag_name = "div";
    me.class = ["widget.title.border"];
    me.draw = function (object) {
        var window = object.parentNode;
        console.log("window.path: " + window.path);
        var is_movable = (window.properties['ui.style.position'] === "absolute");
        object.close = me.ui.element.create({
            "ui.style.class": "widget.title.close",
            "ui.event.pressed": "widget.title.menu"
        }, object);
        object.title = me.ui.element.create({
            "text": "Default",
            "ui.style.class": "widget.title.label",
            "ui.drag.element":window.path
        }, object);
        if(is_movable) {
            object.minimize = me.ui.element.create({
                "ui.style.class": "widget.title.action",
                "ui.event.pressed": "widget.title.minimize",
                "ui.style.right":"20px",
                "members" : {
                    "ui.style.class": "widget.title.minimize",
                }
            }, object);
            object.maximize = me.ui.element.create({
                "ui.style.class": "widget.title.action",
                "ui.event.pressed": "widget.title.maximize",
                "ui.style.right":"0px",
                "members" : {
                    "ui.style.class": "widget.title.maximize",
                }
            }, object);
            object.restore = me.ui.element.create({
                "ui.style.class": "widget.title.action",
                "ui.event.pressed": "widget.title.restore",
                "ui.style.right":"0px",
                "ui.style.visibility":"hidden",
                "members" : {
                    "ui.style.class": "widget.title.restore",
                }
            }, object);
        }
        else {
            me.ui.element.set(object.title, "ui.style.right", "0px");
        }
    };
    me.set_text = function (object, value) {
        me.ui.element.set(object.title, "text", value);
    };
    me.get_text = function (object) {
        return object.innerHTML;
    };
    me.get_title_type = function (object) {
        return object.title_type;
    };
    me.set_title_type = function (object, value) {
        object.title_type = value;
    };
    me.menu = function(object) {
        var region = me.ui.rect.relative_region(object);
        if(me.ui.element.get(object.menu, "ui.node.parent")) {
            me.ui.element.set(object.menu, "ui.node.parent", null);
        }
        else {
            object.menu = me.ui.element.create({
                "component":"widget.menu",
                "ui.style.left":"0px",
                "ui.style.top":region.bottom+"px",
                "ui.group.data" : {
                    "ui.data.keys":["text","select","enabled"],
                    "ui.data.values":[["Restore","widget.title.restore","widget.title.can_restore"],["Move","",false],["Size","",false],["Minimize","widget.title.minimize","widget.title.can_minimize"],["Maximize","widget.title.maximize","widget.title.can_maximize"],["Close","widget.title.close"],["Switch To"]]
                }
            }, object.parentNode);
        }
    };
    me.is_visible = function(object) {
        if(object) {
            var is_visible = me.ui.element.get(object, "ui.style.visibility");
            console.log("object: " + object + " visible: " + is_visible);
            return is_visible !== "hidden";
        }
    }
    me.can_restore = function(object) {
        return me.is_visible(object.parentNode.parentNode.restore);
    };
    me.can_minimize = function(object) {
        return me.is_visible(object.parentNode.parentNode.minimize);
    };
    me.can_maximize = function(object) {
        return me.is_visible(object.parentNode.parentNode.maximize);
    };
    me.close = function(object) {
        var window = object.parentNode.parentNode;
        if(window.parentNode) {
            window.parentNode.removeChild(window);
        }
    };
    me.minimize = function(object) {
        
    };
    me.maximize = function(object) {
        me.ui.element.set(object.parentNode.restore, "ui.style.visibility", "visible");
        me.ui.element.set(object.parentNode.maximize, "ui.style.visibility", "hidden");
        var window = object.parentNode.parentNode;
        window.region = me.ui.rect.absolute_region(window);
        me.ui.rect.set_region(window, me.ui.rect.viewport());
        window.draggable = false;
    };
    me.restore = function(object) {
        console.log("object: " + object.path);
        me.ui.element.set(object.parentNode.restore, "ui.style.visibility", "hidden");
        me.ui.element.set(object.parentNode.maximize, "ui.style.visibility", "visible");
        var window = object.parentNode.parentNode;
        me.ui.rect.set_region(window, window.region);
        window.draggable = true;
    };
};
