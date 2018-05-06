/*
 @author Zakai Hamilton
 @component LibJSGrid
 */

screens.lib.jsgrid = function LibJSGrid(me) {
    me.init = async function () {
        me.jsgrid = await me.core.require("/external/jsgrid-1.5.3/jsgrid.js");
        me.import("/external/jsgrid-1.5.3/jsgrid.css");
        me.import("/external/jsgrid-1.5.3/jsgrid-theme.css");
        me.proxy.apply = me.jsgrid;
    };
    me.proxy.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return me.jsgrid[property].apply(this, args);
        };
    };
};
