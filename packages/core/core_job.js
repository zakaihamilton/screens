/*
 @author Zakai Hamilton
 @component CoreJob
 */

package.core.job = function CoreJob(me) {
    me.jobs = [];
    me.tasks = [];
    me.open = function() {
        var job = package.core.ref.gen();
        me.jobs[job] = {state:true,tasks:[], callback:null};
        return job;
    };
    me.close = function(job, callback) {
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
    me.begin = function(job) {
        var job_info = me.jobs[job];
        if(job_info !== undefined) {
            var task = package.core.ref.gen();
            me.tasks[task] = {job:job};
            job_info.tasks.push(task);
        }
        return task;
    };
    me.end = function(task) {
        var task_info = me.tasks[task];
        if(task_info !== undefined) {
            var job_info = me.jobs[task_info.job];
            job_info.tasks.splice(job_info.tasks.indexOf(task), 1);
            me.tasks.splice(me.tasks.indexOf(task), 1);
            if(job_info.state == false && job_info.tasks.length == 0) {
                job_info.callback(task_info.job);
                me.jobs.splice(me.jobs.indexOf(task_info.job), 1);
            }
        }
    };
};
