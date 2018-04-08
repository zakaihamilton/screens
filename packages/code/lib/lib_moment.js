/*
 @author Zakai Hamilton
 @component LibMoment
 */

screens.lib.moment = function LibMoment(me) {
    me.init = async function () {
        me.moment = await me.core.require("/node_modules/moment/moment.js");
        me.proxy.apply = me.moment;
    };
    me.proxy.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return me.moment[property].apply(this, args);
        };
    };
};
