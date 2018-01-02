/*
 @author Zakai Hamilton
 @component UIData
 */

package.ui.data = function UIData(me) {
    me.default = {
        get: function(object) {
            return object.data_default;
        },
        set : function(object, value) {
            object.data_default = value;
        }
    };
    me.parent = {
        get: function(object) {
            return object.data_parent;
        },
        set : function(object, value) {
            object.data_parent = value;
        }
    };
    me.keyList = {
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
            var elements = [];
            me.collect(object, elements, object.data_values);
            var parent = object;
            if(object.data_parent) {
                parent = object.data_parent;
            }
            me.core.property.set(parent, "ui.basic.elements", elements);
        }
    };
    me.collect = function(object, elements, items) {
        for (var item_index = 0; item_index < items.length; item_index++) {
            var properties = {};
            var values = items[item_index];
            var data_value = null;
            if(typeof values === "string") {
                values = me.core.property.get(object, values);
                if(Array.isArray(values)) {
                    me.collect(object, elements, values);
                }
                continue;
            }
            if(!values) {
                continue;
            }
            for (var data_key_index = 0; data_key_index < object.data_keys.length; data_key_index++) {
                var data_key = object.data_keys[data_key_index];
                var data_value = values[data_key_index];
                if (typeof data_value !== "undefined") {
                    if(data_key === "ui.data.items") {
                        var subElements = [];
                        me.collect(object, subElements, data_value);
                        properties["ui.basic.elements"] = subElements;
                    }
                    else {
                        properties[data_key] = data_value;
                    }
                }
            }
            properties = me.ui.element.combine(object.data_default, properties);
            elements.push(properties);
        }
    };
};
