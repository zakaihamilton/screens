/*
 @author Zakai Hamilton
 @component ModalProgress
 */

screens.modal.progress = function ModalProgress(me) {
    me.launch = function (args) {
        var json = __json__;
        var params = args[0];
        return me.ui.element(json, "workspace", "self", params);
    };
};
