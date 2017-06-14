/*
 @author Zakai Hamilton
 @component WidgetInput
 */

package.widget.input = function WidgetInput(me) {
    me.depends = {
        properties:["text","ui.element.edit","ui.element.rows"]
    };
    me.tag_name = "textarea";
    me.create = function(object) {
        object.type="text";
    };
    me.text = {
        get : function(object) {
            return object.innerHTML;
        },
        set : function(object, value) {
            object.innerHTML = value;
        }
    };
    me.rows = {
        get : function(object) {
            return object.rows;
        },
        set : function(object, value) {
            object.rows = value;
        }
    };
    me.columns = {
        get : function(object) {
            return object.cols;
        },
        set : function(object, value) {
            object.cols = value;
        }
    };
};
