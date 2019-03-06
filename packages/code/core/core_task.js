/*
    @author Zakai Hamilton
    @component CoreTask
*/

screens.core.task = function CoreTask(me, packages) {
    const { core } = packages;
    me.tasks = [];
    me.push = function (method, delay) {
        var task = {
            method,
            delay
        };
        me.log("Scheduled task: " + method + " to run in " + core.string.formatDuration(delay / 1000, true));
        task.handle = setInterval(async () => {
            if (task.running) {
                me.log("Task already running: " + method);
                return;
            }
            task.running = true;
            me.log("Running task: " + method);
            try {
                await core.message.send(task.method, task);
            }
            finally {
                task.running = false;
            }
        }, task.delay);
        me.tasks.push(task);
    };
    me.clear = function (method) {
        if (!method) {
            return;
        }
        me.tasks = me.tasks.filter(item => {
            if (item.method === method) {
                clearInterval(item.handle);
                item.handle = null;
                return false;
            }
            return true;
        });
    };
};
