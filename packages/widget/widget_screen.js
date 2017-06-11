/*
 @author Zakai Hamilton
 @component WidgetScreen
 */

package.widget.screen = function WidgetScreen(me) {
    me.require = {platform:"browser"};
    me.depends = {
        properties:["ui.element.title"]
    };
    me.extend = ["ui.drag"];
    me.type = "div";
    me.class = ["widget.screen.window"];
    me.create = function(object) {
        me.ui.element.create([{
                "ui.style.class": "widget.screen.left_bottom"
            }, {
                "ui.style.class": "widget.screen.right_bottom"
            }], object);
        object.content = me.ui.element.create({
                "ui.style.class": "widget.screen.content"
            }, object);
        me.ui.element.create([{
                "ui.style.class": "widget.screen.left_top"
            }, {
                "ui.style.class": "widget.screen.right_top"
            }], object);
        object.title = me.ui.element.create({
            "ui.element.component":"widget.bar",
            "ui.style.class":"widget.screen.bar",
        }, object);
    };
    me.get_title = function(object) {
        return me.ui.element.get(object.title, "ui.element.text");
    };
    me.set_title = function(object, value) {
        me.ui.element.set(object.title, "ui.element.text", value);
    };
    me.get_background = function(object) {
        return me.ui.element.get(object.content, "ui.style.background");
    };
    me.set_background = function(object, value) {
        me.ui.element.set(object.content, "ui.style.background", value);
    };
};
