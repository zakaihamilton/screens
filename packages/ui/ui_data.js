/*
 @author Zakai Hamilton
 @component UIData
 */

package.ui.data = new function UIData() {
    var me = this;
    me.get_type = function(object) {
        return object.data_type;
    };
    me.set_type = function(object, value) {
        object.data_type = value;
    };
    me.get_source = function(object) {
        return object.data_source;
    };
    me.set_source = function(object, value) {
        object.data_source = value;
    };
    me.group = function(object, value) {
        if(object.data_source) {
            for(var item_index = 0; item_index < object.data_source.length; item_index++) {
                var properties = {};
                properties[object.data_type] = object.data_source[item_index];
                package.ui.element.create(properties, object);
            }
        }
    }
};
