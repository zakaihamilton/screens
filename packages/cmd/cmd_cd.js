/*
    @author Zakai Hamilton
    @component CmdCd
*/

package.cmd.cd = function CmdCd(me) {
    me.cmd = function(terminal, args) {
        var current_dir = terminal.current_dir;
        if(!current_dir) {
            current_dir = "";
        }
        if(args.length <= 1) {
            me.core.cmd.exit(terminal);
            return;
        }
        var tokens = args[1].split("/");
        if(tokens) {
            if(args[1][0] === "/") {
                current_dir = "";
            }
            for(let token of tokens) {
                if(!token) {
                    continue;
                }
                if(token === ".") {
                    continue;
                }
                if(token === "..") {
                    current_dir = me.core.util.removeLast(current_dir, "/");
                    continue;
                }
                if(current_dir) {
                    current_dir += "/";
                }
                current_dir += token;
            }
        }
        if(!current_dir) {
            current_dir = ".";
        }
        me.core.file.readDir(function(err, items) {
            if(err) {
                me.set(terminal, "print", "cd: " + args[1] + ": No such file or directory");
            }
            else {
                terminal.current_dir = current_dir;
            }
            me.core.cmd.exit(terminal);
        }, current_dir);
    };
};
