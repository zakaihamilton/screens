/*
 @author Zakai Hamilton
 @component UIData
 */

package.ui.data = function UIData(me) {
    me.get_keys = function(object) {
        return object.data_keys;
    };
    me.set_keys = function(object, value) {
        object.data_keys = value;
    };
    me.get_values = function(object) {
        return object.data_values;
    };
    me.set_values = function(object, value) {
        object.data_values = value;
    };
    me.group = function(object, value) {
        if(object.data_values) {
            for(var item_index = 0; item_index < object.data_values.length; item_index++) {
                var properties = {};
                for(var data_key_index = 0; data_key_index < object.data_keys.length; data_key_index++) {
                    properties[object.data_keys[data_key_index]] = object.data_values[item_index][data_key_index];
                }
                me.ui.element.create(properties, object);
            }
        }
    }
};
