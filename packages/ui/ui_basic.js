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
            if(object.icon) {
                object = object.icon;
            }
            return object.src;
        },
        set: function (object, value) {
            if(object.icon) {
                object = object.icon;
            }
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
                parent[value] = object;
            }
        }
    };
    me.context = {
        get: function (object) {
            return object.context;
        },
        set: function (object, value) {
            if (value) {
                object.context = value;
            }
        }
    };
    me.content = {
        get : function (object) {
            return object.content;
        },
        set : function (object, value) {
            object.content = value;
        }
    }
    me.elements = {
        set: function(object, value) {
            if (value) {
                var content = me.content.get(object);
                if (!content) {
                    content = object;
                }
                me.ui.element.create(value, content);
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
    me.label = {
        get : function(object) {
            return object.label;
        },
        set : function(object, value) {
            object.label = value;
        }
    };
    me.text = {
        get : function(object) {
            if(object.label) {
                object = object.label;
            }
            return object.innerHTML;
        },
        set : function(object, value) {
            if(object.label) {
                object = object.label;
            }
            object.innerHTML = value;
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
            object.window = value;
        }
    };
};
