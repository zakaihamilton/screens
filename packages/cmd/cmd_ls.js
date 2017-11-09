/*
    @author Zakai Hamilton
    @component CmdLs
*/

package.cmd.ls = function CmdLs(me) {
    me.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = ".";
        }
        me.package.core.file.readDir(function(err, items) {
            if(items) {
                for(let item of items) {
                    me.package.core.property.set(terminal, "print", item);
                }
            }
            me.package.core.cmd.exit(terminal);
        }, current_dir);
    };
    
};
