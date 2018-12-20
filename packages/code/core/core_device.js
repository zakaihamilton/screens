/*
 @author Zakai Hamilton
 @component CoreDevice
 */

screens.core.device = function CoreDevice(me) {
    me.isMobile = function () {
        return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i);
    };
};
