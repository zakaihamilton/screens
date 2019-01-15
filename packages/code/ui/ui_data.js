/*
 @author Zakai Hamilton
 @component UIData
 */

screens.ui.data = function UIData(me) {
    me.default = {
        get: function (object) {
            return object.data_default;
        },
        set: function (object, value) {
            object.data_default = value;
        }
    };
    me.parent = {
        get: function (object) {
            return object.data_parent;
        },
        set: function (object, value) {
            object.data_parent = value;
        }
    };
    me.keyList = {
        get: function (object) {
            return object.data_keys;
        },
        set: function (object, value) {
            object.data_keys = value;
        }
    };
    me.values = {
        get: function (object) {
            return object.data_values;
        },
        set: function (object, value) {
            object.data_values = value;
        }
    };
    me.prefix = {
        get: function (object) {
            return object.data_prefix;
        },
        set: function (object, value) {
            object.data_prefix = value;
        }
    };
    me.suffix = {
        get: function (object) {
            return object.data_suffix;
        },
        set: function (object, value) {
            object.data_suffix = value;
        }
    };
    me.mapping = {
        get: function (object) {
            return object.data_mapping;
        },
        set: function (object, value) {
            object.data_mapping = value;
        }
    };
    me.group = function (object) {
        if (object.data_values) {
            var elements = [];
            me.collect(object, elements, object.data_values);
            var parent = object;
            if (object.data_parent) {
                parent = object.data_parent;
            }
            me.core.property.set(parent, "ui.basic.elements", elements);
        }
    };
    me.collect = function (object, elements, items) {
        for (let item_index = 0; item_index < items.length; item_index++) {
            let keys = object.data_keys;
            let properties = {};
            let values = items[item_index];
            if (typeof values === "string") {
                let prefix = object.data_prefix || "";
                let suffix = object.data_suffix || "";
                values = me.core.property.get(object, prefix + values + suffix);
                if (Array.isArray(values)) {
                    me.collect(object, elements, values);
                }
                continue;
            }
            if (values && !Array.isArray(values)) {
                keys = Object.keys(values);
                let mapping = object.data_mapping;
                if (mapping) {
                    keys = keys.map(key => {
                        if (key in mapping) {
                            key = mapping[key];
                        }
                        return key;
                    });
                }
                values = Object.values(values);
            }
            if (!values) {
                continue;
            }
            for (let data_key_index = 0; data_key_index < keys.length; data_key_index++) {
                let data_key = keys[data_key_index];
                let data_value = values[data_key_index];
                if (typeof data_value !== "undefined") {
                    if (data_key === "properties") {
                        properties = me.ui.element.combine(properties, data_value);
                    }
                    else if (data_key === "ui.data.items") {
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
