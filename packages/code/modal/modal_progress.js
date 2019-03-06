/*
 @author Zakai Hamilton
 @component ModalProgress
 */

screens.modal.progress = function ModalProgress(me, packages) {
    const { core } = packages;
    me.launch = function (args) {
        return me.ui.element.create(me.json, "workspace", "self", args[0]);
    };
    me.specific = function (object, data) {
        var window = me.widget.window.get(object);
        if (data) {
            for (var key in data) {
                core.property.set(window.var.progress, key, data[key]);
            }
        }
        core.property.set(window.var.specific, "ui.style.display", data ? "block" : "none");
        core.property.set(window.var.general, "ui.style.display", data ? "none" : "block");
    };
};
