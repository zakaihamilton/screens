/*
 @author Zakai Hamilton
 @component UIClipboard
 */

screens.ui.clipboard = function UIClipboard(me) {
    me.permissionStatus = null;
    me.init = async function () {
        try {
            if (navigator.permissions) {
                var permissionStatus = await navigator.permissions.query({
                    name: 'clipboard-read'
                });
                me.log("clipboard permission:" + permissionStatus.state);
                me.permissionStatus = permissionStatus;
                permissionStatus.onchange = () => {
                    me.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                }
            }
        }
        catch (err) {
            me.log("Clipboard not supported: " + err.message || err);
        }
    };
    me.isSupported = function () {
        return navigator.clipboard && me.permissionStatus === "granted";
    };
    me.copy = async function (text) {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                me.log("clipboard text copied:" + text);
            }
            catch (err) {
                me.log_error("Could not copy text: " + text + " error: " + err.message || err);
            }
        }
        else {
            callback("Clipboard not supported");
        }
    };
};
