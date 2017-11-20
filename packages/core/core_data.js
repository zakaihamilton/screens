/*
 @author Zakai Hamilton
 @component CoreData
 */

package.core.data = function CoreData(me) {
    me.forward = function (object, property) {
        return {
            get: function (object) {
                var data = null;
                if (object.data && object.data[property]) {
                    data = object.data[property];
                } else if (object.parentNode && object.parentNode.var && object.parentNode.data[property]) {
                    data = object.parentNode.data[property];
                } else if (object.context && object.context && object.context.data[property]) {
                    data = object.context.data[property];
                }
                return data;
            },
            set: function (object, value) {
                if (object && typeof value !== "undefined") {
                    var parent = object;
                    if (object.context) {
                        parent = object.context;
                    }
                    if (!parent.data) {
                        parent.data = {};
                    }
                    parent.data[property] = value;
                }
            }
        };
    };
};
