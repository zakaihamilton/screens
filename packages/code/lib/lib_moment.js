/*
 @author Zakai Hamilton
 @component LibMoment
 */

screens.lib.moment = function LibMoment(me) {
    me.init = function () {
        return new Promise((resolve, reject) => {
            me.core.require((moment) => {
                me.moment = moment;
                me.apply = me.moment;
                resolve();
            }, ['/node_modules/moment/moment.js']);
        });
    };
    me.get = function (object, property) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return me.moment[property].apply(this, args);
        };
    };
};
