/*
    @author Zakai Hamilton
    @component CmdAccess
*/

screens.cmd.access = function CmdAccess(me) {
    me.cmd = async function (terminal, args) {
        var appName = args[1] || "";
        var toggle = args[2] || "";
        me.core.property.set(terminal, "print", "Application: " + appName);
        var userList = await me.user.verify.list();
        var userIndex = 1;
        for (var userItem of userList) {
            me.core.property.set(terminal, "print", userIndex + "/" + userList.length + ": " + userItem.name);
            var access = await me.user.access.get(userItem.userid);
            var modified = false;
            if (!access) {
                access = {};
                modified = true;
            }
            if (!access.apps) {
                access.apps = [];
            }
            if (appName) {
                if (toggle === "add") {
                    if (!access.apps.includes(appName)) {
                        access.apps.push(appName);
                        modified = true;
                    }
                }
                else if (toggle === "remove") {
                    var appIndex = access.apps.indexOf(appName);
                    if (appIndex != -1) {
                        access.apps.splice(appIndex, 1);
                        modified = true;
                    }
                }
                else if (toggle) {
                    me.core.property.set(terminal, "print", "Only add or remove toggle supported");
                    break;
                }
            }
            if (modified) {
                access.name = userItem.name;
                access.email = userItem.email;
                await me.user.access.set(access, userItem.userid);
                me.core.property.set(terminal, "insert", " - Changed");
            }
            userIndex++;
        }
        me.core.cmd.exit(terminal);
    };
};
