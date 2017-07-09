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
        application = "cmd." + args[0];
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
    me.args = {
        set: function(object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function(object, value) {
            var args = me.splitArguments(object.args);
            if(args) {
                package.include("app." + args[0], function(failure) {
                    if(failure) {
                        //todo raise error dialog
                    }
                    else {
                        me.send("app." + args[0] + ".launch", args.slice(1));
                    }
                });
            }
        }
    };
};
