/*
 @author Zakai Hamilton
 @component UIInput
 */

package.ui.input = function UIInput(me) {
    me.depends = {
        properties:["ui.element.text","ui.element.edit","ui.element.rows"]
    };
    me.type = "textarea";
    me.create = function(object) {
        object.type="text";
    };
    me.get_type = function(object) {
        return object.getAtrribute(object, "type")
    };
    me.set_type = function(object, value) {
        object.attributes["type"]=value;
    };
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
    me.get_rows = function(object) {
        return object.rows;
    };
    me.set_rows = function(object, value) {
        object.rows = value;
    };
    me.get_columns = function(object) {
        return object.cols;
    };
    me.set_columns = function(object, value) {
        object.cols = value;
    };
};
