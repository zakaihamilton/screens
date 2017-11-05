/*
    @author Zakai Hamilton
    @component CoreCmd
*/

package.core.cmd = function CoreCmd(me) {
    me.the.application = function(terminal) {
        return terminal.application;
    };
    me.split = function(args, separator=' ') {
        if(args) {
            return [].concat.apply([], args.split('"').map(function(v,i){
               return i%2 ? v : v.split(separator);
            })).filter(Boolean);
        }
        else {
            return [];
        }
    };
    me.handle = function(terminal, args) {
        if(!Array.isArray(args)) {
            args = me.split(args);
        }
        if(!args.length) {
            me.exit(terminal);
            return;
        }
        if(terminal.application) {
            me.the.core.message.send(terminal.application + ".cmd", terminal, args);
            return;
        }
        application = "cmd." + args[0];
        package.include(application, function (info) {
            if (info.failure) {
                me.the.core.property.set(terminal, "print", "Error: Command not found!");
                me.exit(terminal);
            } else if(info.complete) {
                terminal.application = application;
                me.the.core.message.send(application + ".cmd", terminal, args);
            }
        });
    };
    me.exit = function(terminal) {
        terminal.application = null;
        me.the.core.property.set(terminal, "input", "C>");
    };
};
