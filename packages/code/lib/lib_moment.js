/*
 @author Zakai Hamilton
 @component LibMoment
 */

screens.lib.moment = function LibMoment(me) {
    me.init = async function () {
        me.moment = await me.core.require("/node_modules/moment/moment.js");
        me.proxy.apply = me.moment;
    };
    me.unix = function(timestamp) {
        return me.moment.unix(timestamp);
    }
};
