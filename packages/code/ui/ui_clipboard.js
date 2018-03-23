/*
 @author Zakai Hamilton
 @component UIClipboard
 */

package.ui.clipboard = function UIClipboard(me) {
    me.permissionStatus = null;
    me.init = function() {
        try {
            if(navigator.permissions) {
                navigator.permissions.query({
                    name: 'clipboard-read'
                }).then(permissionStatus => {
                    me.core.console.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                    permissionStatus.onchange = () => {
                    me.core.console.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                    };
                }).catch(err => {
                    me.core.console.log("Clipboard not supported: " + err.message || err);
                });
            }
        }
        catch(err) {
            me.core.console.log("Clipboard not supported: " + err.message || err);
        }
    };
    me.isSupported = function() {
        return navigator.clipboard && permissionStatus === "granted";
    };
    me.copy = function(callback, text) {
        if(navigator.clipboard) {
            navigator.clipboard.writeText(text)
            .then(() => {
                me.core.console.log("clipboard text copied:" + text);
                if(callback) {
                    callback();
                }
            })
            .catch(err => {
            me.core.console.error("Could not copy text: " + text + " error: " + err.message || err);
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
