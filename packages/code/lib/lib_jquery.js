/*
 @author Zakai Hamilton
 @component LibJQuery
 */

screens.lib.jquery = function LibJQuery(me) {
    me.init = async function () {
        me.jquery = await me.core.require("/node_modules/jquery/dist/jquery.js");
        me.proxy.apply = me.jquery;
    };
    me.proxy.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return me.jquery[property].apply(this, args);
        };
    };
};
