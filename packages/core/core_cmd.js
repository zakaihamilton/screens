/*
    @author Zakai Hamilton
    @component CoreCmd
*/

package.core.cmd = function CoreCmd(me) {
    me.application = function(terminal) {
        return terminal.application;
    };
    me.splitArguments = function(args) {
        return [].concat.apply([], args.split('"').map(function(v,i){
           return i%2 ? v : v.split(' ');
        })).filter(Boolean);
    };
    me.handle = function(terminal, args) {
        if(!Array.isArray(args)) {
            args = me.splitArguments(args);
        }
        if(!args.length) {
            me.exit(terminal);
            return;
        }
        if(terminal.application) {
            me.send(terminal.application + ".cmd", terminal, args);
            return;
        }
        var cmd = args[0];
        var application = null;
        if(me["cmd"]) {
            me["cmd"].components.map(function(name) {
                if(cmd !== name) {
                    return;
                }
                application = name;
            });
        }
        if(application) {
            terminal.application = application;
            me.send(application + ".cmd", terminal, args);
            return;
        }
        application = "cmd." + cmd;
        package.include(application, function (failure) {
            if (failure) {
                me.set(terminal, "print", "Error: Command not found!");
                me.exit(terminal);
            } else {
                terminal.application = application;
                me.send(application + ".cmd", terminal, args);
            }
        });
    };
    me.exit = function(terminal) {
        terminal.application = null;
        me.set(terminal, "input", "C>");
    };
};
