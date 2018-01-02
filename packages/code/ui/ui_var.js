/*
 @author Zakai Hamilton
 @component UIVar
 */

package.ui.var = function UIVar(me) {
    me.forward = function (object, property) {
        return {
            get: function (object) {
                var variable = null;
                if (object.var && object.var[property]) {
                    variable = object.var[property];
                } else if (object.parentNode && object.parentNode.var && object.parentNode.var[property]) {
                    variable = object.parentNode.var[property];
                } else if (object.context && object.context && object.context.var[property]) {
                    variable = object.context.var[property];
                }
                return variable;
            },
            set: function (object, value) {
                if (object && typeof value !== "undefined") {
                    var parent = object;
                    if (object.context) {
                        parent = object.context;
                    }
                    if (!parent.var) {
                        parent.var = {};
                    }
                    parent.var[property] = value;
                }
            }
        };
    };
};
