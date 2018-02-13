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
            wait:me.wait,
            waitAll:me.waitAll,
            isRunning:true,
            isWaiting:false,
            asyncQueue:[],
            waitCount:0,
            responseCallback:null,
            completeCallback:null,
            endCallback:endCallback
        };
        flow.callback = function(args) {
            if(flow.isRunning) {
                var args = Array.prototype.slice.call(arguments, 0);
                if(flow.responseCallback) {
                    flow.responseCallback.apply(flow, args);
                }
                flow.waitCount--;
                if(!flow.waitCount && flow.completeCallback) {
                    flow.completeCallback(flow);
                }
            }
        };
        startCallback(flow);
    };
    me.check = function(statement, message) {
        if(this.isRunning && !statement) {
            this.isRunning = false;
            if(this.endCallback) {
                this.endCallback(new Error(message));
            }
        }
    };
    me.async = function(method, args) {
        if(this.isRunning && method) {
            var args = Array.prototype.slice.call(arguments, 1);
            if(!this.asyncQueue) {
                this.asyncQueue = [];
            }
            this.asyncQueue.push({method:method, args:args});
        }
    };
    me.error = function(err, message) {
        if(this.isRunning && err) {
            this.isRunning = false;
            if(this.endCallback) {
                this.endCallback(new Error(message + " | " + err.message));
            }
        }
    };
    me.wait = function(responseCallback, completeCallback) {
        if(this.isRunning) {
            this.responseCallback = responseCallback;
            this.completeCallback = completeCallback;
            var queue = this.asyncQueue;
            this.asyncQueue = [];
            if(queue.length) {
                queue.map((call) => {
                    call.method.apply(this, call.args);
                });
                this.waitCount = queue.length;
            }
        }
    };
    me.end = function(args) {
        if(this.isRunning) {
            this.isRunning = false;
            if(this.endCallback) {
                var args = Array.prototype.slice.call(arguments, 0);
                this.endCallback.apply(this, args);
            }
        }
    };
    me.code = function(callback) {
        if(this.isRunning && callback) {
            callback();
        }
    };
};
