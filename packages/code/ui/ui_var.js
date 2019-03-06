/*
 @author Zakai Hamilton
 @component UIVar
 */

screens.ui.var = function UIVar(me, packages) {
    me.lookup = {
        get: function (object, value, property) {
            var variable = null;
            if (object.var && object.var[property]) {
                variable = object.var[property];
            } else if (object.parentNode && object.parentNode.var && object.parentNode.var[property]) {
                variable = object.parentNode.var[property];
            } else if (object.context && object.context && object.context.var && object.context.var[property]) {
                variable = object.context.var[property];
            }
            return variable;
        },
        set: function (object, value, property) {
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
