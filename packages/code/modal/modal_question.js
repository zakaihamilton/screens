/*
 @author Zakai Hamilton
 @component ModalQuestion
 */

screens.modal.question = function ModalQuestion(me, { core, widget, ui }) {
    me.launch = function (args) {
        let window = ui.element.create(me.json, "workspace", "self", args[0]);
        window.promise = new Promise((resolve, reject) => {
            window.resolve = resolve;
            window.reject = reject;
            window.close = reject;
        });
        core.property.set(window, "app", me);
        return window.promise;
    };
    me.action = function (object, action) {
        let window = widget.window.get(object);
        if (action in window) {
            window.close = window[action];
            core.property.set(window, "close");
        }
    };
    me.close = function (object) {
        let window = widget.window.get(object);
        if (window.close) {
            window.close();
        }
    };
};
