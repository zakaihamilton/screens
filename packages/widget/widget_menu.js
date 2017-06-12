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
    me.tag_name = "a";
    me.class="widget.menu.item";
    me.depends = {
        parent:["widget.menu"],
        properties:["text"]
    };
    me.update = {
        "ui.event.pressed":"widget.menu.item.pressed"
    };
    me.create = function(object) {
        object.href = "#";
        var label = document.createTextNode(object.properties["text"]);
        object.appendChild(label);
    };
    me.set_select = function(object, value) {
        object.select = value;
    };
    me.pressed = function(object) {
        me.ui.element.set(object.parentNode, "select", object.select);
    };
};
