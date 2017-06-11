/*
 @author Zakai Hamilton
 @component WidgetBar
 */

package.widget.bar = function WidgetBar(me) {
    me.type = "div";
    me.set_class = function (object, value) {
        object.close = me.ui.element.create({
            "ui.style.class": value + "_close"
        }, object);
        object.title = me.ui.element.create({
            "ui.element.text": "Default",
            "ui.style.class": value + "_title",
            "ui.drag.element":object.parentNode.path
        }, object);
        object.minimize = me.ui.element.create({
            "ui.style.class": value + "_minimize"
        }, object);
        object.maximize = me.ui.element.create({
            "ui.style.class": value + "_maximize"
        }, object);
    };
    me.set_text = function (object, value) {
        me.ui.element.set(object.title, "ui.element.text", value);
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
