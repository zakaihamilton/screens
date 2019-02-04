/*
 @author Zakai Hamilton
 @component ModalProgress
 */

screens.modal.progress = function ModalProgress(me) {
    me.launch = function (args) {
        return me.ui.element.create(me.json, "workspace", "self", args[0]);
    };
    me.specific = function (object, data) {
        var window = me.widget.window.get(object);
        if (data) {
            for (var key in data) {
                me.core.property.set(window.var.progress, key, data[key]);
            }
        }
        me.core.property.set(window.var.specific, "ui.style.display", data ? "block" : "none");
        me.core.property.set(window.var.general, "ui.style.display", data ? "none" : "block");
    };
};
