/*
 @author Zakai Hamilton
 @component UIShare
 */

screens.ui.share = function UIClipboard(me) {
    me.importData = async function (object, text, title) {
        if (navigator.share) {
            await navigator.share({
                title,
                text,
            });
        }
    };
    return "browser";
};
