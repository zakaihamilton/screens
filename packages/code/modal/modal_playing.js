/*
 @author Zakai Hamilton
 @component ModalPlaying
 */

screens.modal.playing = function ModalPlaying(me) {
    me.launch = function (args) {
        var json = __json__;
        var params = args[0];
        return me.ui.element(json, "workspace", "self", params);
    };
    me.layout = function(object, value) {
         var window = me.widget.window(object);
         me.core.property.set(window.var.layout, "ui.basic.html", value);
    };
    me.fontSize = {
        get: function(object) {
            var window = me.widget.window(object);
            return me.core.property.get(window.var.layout, "ui.style.fontSize");
        },
        set: function(object, value) {
            var window = me.widget.window(object);
            me.core.property.set(window.var.layout, "ui.style.fontSize", value);
        }
    };
};
