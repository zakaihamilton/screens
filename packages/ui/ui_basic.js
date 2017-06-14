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
        get: function (object) {
            return object.var;
        },
        set: function (object, value) {
            if (value) {
                object.parentNode[value] = object.path;
                object.var = value;
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
                object = me.ui.element.to_object(object.label);
            }
            return object.innerHTML;
        },
        set : function(object, value) {
            if(object.label) {
                object = me.ui.element.to_object(object.label);
            }
            object.innerHTML = value;
        }
    };
};
