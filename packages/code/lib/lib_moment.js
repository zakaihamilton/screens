/*
 @author Zakai Hamilton
 @component LibMoment
 */

package.lib.moment = function LibMoment(me) {
    me.init = function (task) {
        me.lock(task, (task) => {
            me.core.require.require((moment) => {
                me.moment = moment;
                me.apply = me.moment;
                me.unlock(task);
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
