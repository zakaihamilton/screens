/*
 @author Zakai Hamilton
 @component PopupProgress
 */

screens.popup.progress = function PopupProgress(me) {
    me.launch = function (args) {
        var json = __json__;
        var params = args[0];
        return me.ui.element(json, "workspace", "self", params);
    };
};
