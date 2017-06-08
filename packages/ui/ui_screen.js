/*
 @author Zakai Hamilton
 @component UIScreen
 */

package.ui.screen = new function UIScreen() {
    var me = this;
    me.platform = "browser";
    me.depends = {
        properties:["ui.element.title"]
    };
    me.type = "div";
    me.class = "ui.screen.window";
    me.extend = ["ui.drag"];
    me.create = function(object) {
        object.title = package.ui.element.create({
            "ui.element.text":"",
            "ui.style.class":"ui.screen.title"
        }, object);
    };
    me.set_title = function(object, value) {
        package.ui.element.set(object.title, "ui.element.text", value);
    };
    me.get_title = function(object) {
        return package.ui.element.get(object.title, "ui.element.text");
    };
};
