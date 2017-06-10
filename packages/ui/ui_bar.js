/*
 @author Zakai Hamilton
 @component UIBar
 */

package.ui.bar = function UIBar(me) {
    me.type = "div";
    me.set_class = function (object, value) {
        object.close = package.ui.element.create({
            "ui.style.class": value + "_close"
        }, object);
        object.title = package.ui.element.create({
            "ui.element.text": "Default",
            "ui.style.class": value + "_title",
            "ui.drag.element":object.parentNode.path
        }, object);
        object.minimize = package.ui.element.create({
            "ui.style.class": value + "_minimize"
        }, object);
        object.maximize = package.ui.element.create({
            "ui.style.class": value + "_maximize"
        }, object);
    };
    me.set_text = function (object, value) {
        package.ui.element.set(object.title, "ui.element.text", value);
    };
    me.get_text = function (object) {
        return object.innerHTML;
    };
    me.get_bar_type = function (object) {
        return object.bar_type;
    };
    me.set_bar_type = function (object, value) {
        object.bar_type = value;
    };
};
