/*
 @author Zakai Hamilton
 @component ModalQuestion
 */

screens.modal.question = function ModalQuestion(me, packages) {
    const { core, widget, ui } = packages;
    me.launch = function (args) {
        let window = ui.element.create(me.json, "workspace", "self", args[0]);
        window.promise = new Promise((resolve, reject) => {
            window.resolve = resolve;
            window.reject = reject;
        });
        return window.promise;
    };
    me.action = function (object, action) {
        let window = widget.window.get(object);
        if (action in window) {
            core.property.set(window, "close");
            window[action]();
        }
    };
};
