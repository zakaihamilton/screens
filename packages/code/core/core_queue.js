/*
 @author Zakai Hamilton
 @component CoreProperty
 */

package.core.queue = function CoreQueue(me) {
    me.queue = function(queue, func) {
        var args = Array.prototype.slice.call(arguments, 2);
        queue.push({func:func, args:args});
    };
    me.exec = function(callback, queue) {
        if(queue) {
            queue = queue.slice();
            me.lock((task) => {
                var item = queue.shift();
                item.func.apply(null, item.args);
            });
            /* CONTINUE WORK ON QUEUE */
        }
    };
};