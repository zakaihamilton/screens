/*
 @author Zakai Hamilton
 @component UIScreen
 */

package.ui.screen = function UIScreen(me) {
    me.require = {platform:"browser"};
    me.depends = {
        properties:["ui.element.title"]
    };
    me.extend = ["ui.drag"];
    me.type = "div";
    me.class = "ui.screen.window";
    me.create = function(object) {
        package.ui.element.create([{
                "ui.style.class": "ui.screen.left_bottom"
            }, {
                "ui.style.class": "ui.screen.right_bottom"
            }], object);
        object.content = package.ui.element.create({
                "ui.style.class": "ui.screen.content"
            }, object);
        package.ui.element.create([{
                "ui.style.class": "ui.screen.left_top"
            }, {
                "ui.style.class": "ui.screen.right_top"
            }], object);
        object.title = package.ui.element.create({
            "ui.element.component":"ui.bar",
            "ui.style.class":"ui.screen.bar",
        }, object);
    };
    me.get_title = function(object) {
        return package.ui.element.get(object.title, "ui.element.text");
    };
    me.set_title = function(object, value) {
        package.ui.element.set(object.title, "ui.element.text", value);
    };
    me.get_background = function(object) {
        return package.ui.element.get(object.content, "ui.style.background");
    };
    me.set_background = function(object, value) {
        package.ui.element.set(object.content, "ui.style.background", value);
    };
};
