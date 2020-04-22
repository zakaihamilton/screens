/*
 @author Zakai Hamilton
 @component UIShare
 */

screens.ui.share = function UIShare(me, { core, ui }) {
    me.init = async function () {
        if (navigator.share) {
            core.broadcast.register(me, {
                exportMenu: "ui.share.exportMenu"
            });
        }
    };
    me.exportMenu = function (window, method) {
        return {
            text: "Share",
            select: () => {
                core.property.set(window, method, ui.share);
            }
        };
    };
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
