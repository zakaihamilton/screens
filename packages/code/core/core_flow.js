/*
    @author Zakai Hamilton
    @component CoreFlow
*/

package.core.flow = function CoreFlow(me) {
    me.init = function() {
        package.flow = me.flow;
    };
    me.flow = function(endCallback, startCallback) {
        var flow = {
            check:me.check,
            async:me.async,
            error:me.error,
            code:me.code,
            end:me.end,
            callback:me.callback,
            wait:me.wait,
            isRunning:true,
            isWaiting:false,
            asyncQueue:[],
            response:null,
            endCallback:endCallback
        };
        startCallback(flow);
    };
    me.check = function(statement, message) {
        if(this.running && !statement) {
            this.running = false;
            if(this.endCallback) {
                this.endCallback(new Error(message));
            }
        }
    };
    me.async = function(method, args) {
        if(this.running && method) {
            var args = Array.prototype.slice.call(arguments, 1);
            this.asyncQueue.push({method:method, args:args});
        }
    };
    me.error = function(err, message) {
        if(this.running && err) {
            this.running = false;
            if(this.endCallback) {
                this.endCallback(new Error(message + " | " + err.message));
            }
        }
    };
    me.wait = function(callback) {
        if(this.running) {
            this.response = callback;
            var queue = this.asyncQueue;
            this.asyncQueue = [];
            queue.map((call) => {
                call.method.apply(this, call.args);
            });
        }
    };
    me.end = function(args) {
        if(this.running) {
            this.running = false;
            if(this.endCallback) {
                var args = Array.prototype.slice.call(arguments, 1);
                this.endCallback.apply(this, args);
            }
        }
    };
    me.callback = function(args) {
        if(this.running) {
            var args = Array.prototype.slice.call(arguments, 1);
            this.response.apply(this, args);
        }
    };
    me.code = function(callback) {
        if(this.running && callback) {
            callback();
        }
    };
};
