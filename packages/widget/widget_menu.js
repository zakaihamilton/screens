/*
 @author Zakai Hamilton
 @component WidgetMenu
 */

package.widget.menu = function WidgetMenu(me) {
    me.tag_name="div";
    me.class = ["widget.menu.border"];
    me.extend = ["ui.popup"];
    me.close = function(object) {
        if(object.parentNode) {
            object.parentNode.removeChild(object);
        }
        me.ui.popup.close(object);
    };
    me.select = {
        set : function(object, value) {
            me.send(value,object);
            me.close(object);
        }
    };
};

package.widget.menu.item = function WidgetMenuItem(me) {
    me.tag_name = "button";
    me.class="widget.menu.item";
    me.depends = {
        parent:["widget.menu"],
        properties:["text"]
    };
    me.update = {
        "ui.event.pressed":"widget.menu.item.pressed"
    };
    me.text = {
        get : function(object) {
            return object.innerHTML;
        },
        set : function(object, value) {
            object.innerHTML = value;
        }
    };
    me.select = {
        get : function(object) {
            return object.select_method;
        },
        set : function(object, value) {
            object.select_method = value;
        }
    };
    me.enabled = {
        get : function(object) {
            return !object.getAttribute('disabled');
        },
        set : function(object, value) {
            if(typeof value === "string") {
                value = me.send(value,object);
            }
            if(value) {
                object.removeAttribute('disabled');            
            }
            else {
                object.setAttribute('disabled', true);            
            }
        }
    };
    me.pressed = function(object) {
        me.ui.element.set(object.parentNode, "select", object.select_method);
    };
};
