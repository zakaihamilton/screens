/*
 @author Zakai Hamilton
 @component UIShare
 */

screens.ui.share = function UIClipboard(me, packages) {
    me.permissionStatus = null;
    me.init = async function () {
        if (navigator.share) {
            me.importData = function (object, text, title) {
                navigator.share({
                    title,
                    text,
                })
                    .then(() => me.log("Successful share"))
                    .catch((error) => me.error("Error sharing:" + error));
            };
        }
    };
    return "browser";
};
