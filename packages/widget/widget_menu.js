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
    me.set_select = function(object, value) {
        me.core.message.send({path:value,params:[object]});
        me.close(object);
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
    me.set_text = function(object, value) {
        object.innerHTML = value;
    };
    me.get_text = function(object) {
        return object.innerHTML;
    };
    me.get_select = function(object) {
        return object.select_method;
    };
    me.set_select = function(object, value) {
        object.select_method = value;
        return true;
    };
    me.get_enabled = function(object) {
        return !object.getAttribute('disabled');
    };
    me.set_enabled = function(object, value) {
        console.log("before label: " + object.innerHTML + " value: " + value + " object:" + object + "path: " + object.path);
        if(typeof value === "string") {
            value = me.core.message.send({path:value,params:[object]});
        }
        console.log("label: " + object.innerHTML + " value: " + value + " object:" + object + "path: " + object.path);
        if(value) {
            object.removeAttribute('disabled');            
        }
        else {
            object.setAttribute('disabled', true);            
        }
        return true;
    };
    me.pressed = function(object) {
        me.ui.element.set(object.parentNode, "select", object.select_method);
    };
};
