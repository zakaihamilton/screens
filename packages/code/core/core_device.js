/*
 @author Zakai Hamilton
 @component CoreDevice
 */

screens.core.device = function CoreDevice(me, packages) {
    me.isMobile = function () {
        return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone|iPad|iPod/i);
    };
    me.isNotMobile = function () {
        return !me.isMobile();
    };
};
