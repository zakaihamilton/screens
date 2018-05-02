/*
 @author Zakai Hamilton
 @component UIParam
 */

screens.ui.param = function UIParam(me) {
    me.proxy.get = function (object, property) {
        return {
            get: function (object, value) {
                var param = value;
                while(object) {
                    if (object.params && object.params[property]) {
                        param = object.params[property];
                    } else if (object.parentNode && object.parentNode.params && object.parentNode.params[property]) {
                        param = object.parentNode.params[property];
                    } else if (object.context && object.context && object.context.params && object.context.params[property]) {
                        param = object.context.params[property];
                    }
                    if(param) {
                        break;
                    }
                    object = object.parentNode;
                }
                return param;
            },
            set: function (object, value) {
                if (object && typeof value !== "undefined") {
                    var parent = object;
                    if (object.context) {
                        parent = object.context;
                    }
                    if (!parent.params) {
                        parent.params = {};
                    }
                    parent.params[property] = value;
                }
            }
        };
    };
};
