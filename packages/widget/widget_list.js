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
    me.selection = {
        get :function(object) {
            return object.options[object.selectedIndex].value;
        }
    };
    me.count = {
        get: function(object) {
            return object.size;
        },
        set: function(object, value) {
            object.size = value;
        }
    };
    me.multiple = {
        get: function(object) {
            return object.multiple;
        },
        set : function(object, value) {
            object.multiple = value;
        }
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
