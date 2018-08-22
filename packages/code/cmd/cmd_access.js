/*
    @author Zakai Hamilton
    @component CmdAccess
*/

screens.cmd.access = function CmdAccess(me) {
    me.cmd = async function(terminal, args) {
        if(args.length <= 2) {
            me.core.cmd.exit(terminal);
            return;
        }
        var appName = args[1];
        var toggle = args[2];
        me.core.property.set(terminal, "print", "Application: " + appName);
        var userList = await me.user.verify.list();
        for(var userItem of userList) {
            me.core.property.set(terminal, "print", userItem.name);
            var access = await me.user.access.get(userItem.userid);
            if(!access) {
                access = {};
            }
            if(!access.apps) {
                access.apps = [];
            }
            if(toggle === "add") {
                if(!access.apps.includes(appName)) {
                    access.apps.push(appName);
                }
            }
            else if(toggle === "remove") {
                var appIndex = access.apps.indexOf(appName);
                if(appIndex != -1) {
                    access.apps.splice(appIndex, 1);
                }
            }
            access.name = userItem.name;
            await me.user.access.set(access, userItem.userid);
        }
        me.core.cmd.exit(terminal);
    };
};
