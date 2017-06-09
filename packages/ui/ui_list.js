/*
 @author Zakai Hamilton
 @component UIList
 */

package.ui.list = new function UIList() {
    var me = this;
    me.depends = {
        properties:["ui.group.data","ui.element.count"]
    };
    me.type = "select";
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
