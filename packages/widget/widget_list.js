/*
 @author Zakai Hamilton
 @component WidgetList
 */

package.widget.list = function WidgetList(me) {
    me.depends = {
        properties:["ui.group.data","ui.element.count"]
    };
    me.tag_name = "select";
    me.get_selection = function(object) {
        return object.options[object.selectedIndex].value;
    };
    me.get_count = function(object) {
        return object.size;
    };
    me.set_count = function(object, value) {
        object.size = value;
    };
    me.get_multiple = function(object) {
        return object.multiple;
    };
    me.set_multiple = function(object, value) {
        object.multiple = value;
    };
};
