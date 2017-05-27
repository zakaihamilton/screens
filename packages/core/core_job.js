/*
 @author Zakai Hamilton
 @component CoreJob
 */

package.core.job = new function() {
    this.jobs = [];
    this.tasks = [];
    this.open = function() {
        var job = packages.core.ref.gen();
        this.jobs[job] = {state:true,tasks:[], callback:null};
        return job;
    };
    this.close = function(job, callback) {
        var job_info = this.jobs[job];
        if(job_info !== undefined) {
            job_info.callback = callback;
            job_info.state = false;
            if(job_info.tasks.length === 0) {
                callback(job);
            }
        }
    };
    this.begin = function(job) {
        var job_info = this.jobs[job];
        if(job_info !== undefined) {
            var task = packages.core.ref.gen();
            this.tasks[task] = {job:job};
            job_info.tasks.push(task);
        }
        return task;
    };
    this.end = function(task) {
        var task_info = this.tasks[task];
        if(task_info !== undefined) {
            var job_info = this.jobs[task_info.job];
            var index = job_info.tasks.indexOf(task);
            if (index > -1) {
                job_info.tasks.splice(index, 1);
            }
            this.tasks.delete(task);
            if(job_info.state == false && job_info.tasks.length == 0) {
                job_info.callback(job);
            }
            this.jobs.delete(job);
        }
    };
};
