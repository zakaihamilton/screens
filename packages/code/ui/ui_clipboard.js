/*
 @author Zakai Hamilton
 @component UIClipboard
 */

screens.ui.clipboard = function UIClipboard(me, { core, ui }) {
    me.permissionStatus = null;
    me.init = async function () {
        try {
            if (navigator.permissions) {
                var permissionStatus = await navigator.permissions.query({
                    name: "clipboard-read"
                });
                me.log("clipboard permission:" + permissionStatus.state);
                me.permissionStatus = permissionStatus;
                permissionStatus.onchange = () => {
                    me.log("clipboard permission:" + permissionStatus.state);
                    me.permissionStatus = permissionStatus;
                };
            }
            core.broadcast.register(me, {
                exportMenu: "ui.clipboard.exportMenu"
            });
        }
        catch (err) {
            me.log("Clipboard not supported: " + err.message || err);
        }
    };
    me.exportMenu = function (window, method) {
        return {
            text: "Clipboard",
            select: () => {
                core.property.set(window, method, ui.clipboard);
            }
        };
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
                var error = "Could not copy text: " + text + " error: " + err;
                me.log_error(error);
                throw error;
            }
        }
        else {
            throw "Clipboard not supported";
        }
    };
    me.importData = function (object, text) {
        me.copy(text);
    };
    return "browser";
};
