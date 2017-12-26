/*
 @author Zakai Hamilton
 @component CmdClean
 */

package.cmd.clean = function CmdClean(me) {
    me.cmd = function (terminal, args) {
        var cache_dir = "cache";
        me.lock(task => {
            me.core.file.readDir(function (err, items) {
                if (items) {
                    for (let item of items) {
                        me.lock(task, task => {
                            me.core.file.delete(function (err) {
                                if (err) {
                                    me.core.property.set(terminal, "print", "cannot delete " + item);
                                } else {
                                    me.core.property.set(terminal, "print", item);
                                }
                                me.unlock(task);
                            }, cache_dir + "/" + item);
                        });
                    }
                }
                me.unlock(task, () => {
                    me.core.cmd.exit(terminal);
                });
            }, cache_dir);
        });
    };
};
