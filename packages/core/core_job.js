/*
 @author Zakai Hamilton
 @component CoreJob
 */

package.core.job = function CoreJob(me) {
    me.jobs = [];
    me.tasks = [];
    me.create = function() {
        var job = me.package.core.ref.gen();
        me.jobs[job] = {state:true,tasks:[], callback:null};
        return job;
    };
    me.complete = function(job, callback) {
        var job_info = me.jobs[job];
        if(job_info !== undefined) {
            job_info.callback = callback;
            job_info.state = false;
            if(job_info.tasks.length === 0) {
                callback(job);
                me.jobs.splice(me.jobs.indexOf(job), 1);
            }
        }
    };
    me.open = function(job) {
        var job_info = me.jobs[job];
        if(job_info !== undefined) {
            var task = me.package.core.ref.gen();
            me.tasks[task] = {job:job};
            job_info.tasks.push(task);
        }
        return task;
    };
    me.close = function(task) {
        var task_info = me.tasks[task];
        if(task_info !== undefined) {
            var job_info = me.jobs[task_info.job];
            job_info.tasks.splice(job_info.tasks.indexOf(task), 1);
            me.tasks.splice(me.tasks.indexOf(task), 1);
            if(job_info.state === false && job_info.tasks.length === 0) {
                job_info.callback(task_info.job);
                me.jobs.splice(me.jobs.indexOf(task_info.job), 1);
            }
        }
    };
    me.task = function(job, callback) {
        var task = me.open(job);
        callback(task);
    }
};
