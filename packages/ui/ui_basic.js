/*
 @author Zakai Hamilton
 @component UIBasic
 */

package.ui.basic = function UIBasic(me) {
    me.tag = {
        get: function (object) {
            return object.tag;
        }
    };
    me.elementId = {
        get: function (object) {
            return object.id;
        },
        set: function (object, value) {
            object.id = value;
        }
    };
    me.src = {
        get: function (object) {
            return object.src;
        },
        set: function (object, value) {
            object.src = value;
        }
    };
    me.href = {
        get: function (object) {
            return object.href;
        },
        set: function (object, value) {
            object.href = value;
        }
    };
    me.htmlFor = {
        get: function (object) {
            return object.htmlFor;
        },
        set: function (object, value) {
            object.htmlFor = value;
        }
    };
    me.type = {
        get: function (object) {
            return object.type;
        },
        set: function (object, value) {
            object.type = value;
        }
    };
    me.var = {
        set: function (object, value) {
            if (value) {
                var parent = object.parentNode;
                if(object.context) {
                    parent = object.context;
                }
                console.log("storing var component: " + parent.component + " context: " + object.context + " storing var: " + value);
                parent.var[value] = object;
            }
        }
    };
    me.elements = {
        set: function(object, value) {
            if (value) {
                me.ui.element.create(value, object, object.context);
            }
        }
    };
    me.enabled = {
        get : function(object) {
            return !object.getAttribute('disabled');
        },
        set : function(object, value) {
            if(value) {
                object.removeAttribute('disabled');            
            }
            else {
                object.setAttribute('disabled', true);            
            }
        }
    };
    me.text = {
        get : function(object) {
            return object.textContent;
        },
        set : function(object, value) {
            object.textContent = value;
        }
    };
    me.readOnly = {
        get: function(object) {
            return object.readOnly;
        },
        set: function(object, value) {
            object.readOnly = value;
        }
    };
    me.draggable = {
        get : function(object) {
            return object.draggable;
        },
        set : function(object, value) {
            object.draggable = value;
        }
    };
    me.window = {
        get: function (object) {
            return object.window;
        },
        set: function (object, value) {
            if(!value) {
                value = object;
            }
            object.window = me.widget.window.window(value);
        }
    };
    me.target = {
        get: function (object) {
            return object.target;
        },
        set: function (object, value) {
            object.target = value;
        }
    };
};
