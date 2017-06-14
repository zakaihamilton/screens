/*
 @author Zakai Hamilton
 @component WidgetList
 */

package.widget.list = function WidgetList(me) {
    me.depends = {
        properties:["ui.group.data","ui.element.count"]
    };
    me.default = {
        "ui.basic.tag" : "select"
    };
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

package.widget.list.item = function WidgetListItem(me) {
    me.default = {
        "ui.basic.tag" : "option"
    };
    me.depends = {
        parent:["widget.list"],
        properties:["ui.basic.text"]
    };
    me.value = {
        get : function(object) {
            return object.getAtrribute("value");
        },
        set : function(object, value) {
            object.setAttribute("value", value);
        }
    };
};
