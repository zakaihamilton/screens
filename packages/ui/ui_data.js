/*
 @author Zakai Hamilton
 @component UIData
 */

package.ui.data = function UIData(me) {
    me.keys = {
        get: function(object) {
            return object.data_keys;
        },
        set : function(object, value) {
            object.data_keys = value;
        }
    };
    me.values = {
        get: function(object) {
            return object.data_values;
        },
        set : function(object, value) {
            object.data_values = value;
        }
    };
    me.group = function (object, value) {
        if (object.data_values) {
            for (var item_index = 0; item_index < object.data_values.length; item_index++) {
                var properties = {};
                for (var data_key_index = 0; data_key_index < object.data_keys.length; data_key_index++) {
                    var data_value = object.data_values[item_index][data_key_index];
                    if (typeof data_value !== "undefined") {
                        properties[object.data_keys[data_key_index]] = data_value;
                    }
                }
                me.ui.element.create(properties, object);
            }
        }
    }
};
