/*
 @author Zakai Hamilton
 @component WidgetInput
 */

package.widget.input = function WidgetInput(me) {
    me.depends = {
        properties:["ui.basic.text","ui.element.edit","ui.element.rows"]
    };
    me.default = {
        "ui.basic.tag" : "textarea",
        "ui.basic.type" : "text"
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
