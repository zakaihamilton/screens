/*
 @author Zakai Hamilton
 @component UIClipboard
 */

screens.ui.clipboard = function UIClipboard(me) {
    me.permissionStatus = null;
    me.init = function() {
        try {
            if(navigator.permissions) {
                navigator.permissions.query({
                    name: 'clipboard-read'
                }).then(permissionStatus => {
                    me.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                    permissionStatus.onchange = () => {
                    me.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                    };
                }).catch(err => {
                    me.log("Clipboard not supported: " + err.message || err);
                });
            }
        }
        catch(err) {
            me.log("Clipboard not supported: " + err.message || err);
        }
    };
    me.isSupported = function() {
        return navigator.clipboard && permissionStatus === "granted";
    };
    me.copy = function(callback, text) {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(text)
            .then(() => {
                me.log("clipboard text copied:" + text);
                if(callback) {
                    callback();
                }
            })
            .catch(err => {
            me.error("Could not copy text: " + text + " error: " + err.message || err);
            if(callback) {
                callback(err);
            }
            });
        }
        else {
            callback("Clipboard not supported");
        }
    };
};
