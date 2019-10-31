/*
    @author Zakai Hamilton
    @component CmdAccess
*/

screens.cmd.access = function CmdAccess(me, { core, user }) {
    me.cmd = async function (terminal, args) {
        var appName = args[1] || "";
        var toggle = args[2] || "";
        var userName = args[3] || "";
        core.property.set(terminal, "print", "Application: " + appName);
        var userList = await user.verify.list();
        var userIndex = 1;
        for (var userItem of userList) {
            if (userName && userItem.name !== userName) {
                continue;
            }
            core.property.set(terminal, "print", userIndex + "/" + userList.length + ": " + userItem.name + " - " + userItem.email + " - " + userItem.user);
            var access = await user.access.get(userItem.user);
            var modified = false;
            if (!access || !access.name) {
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
                    core.property.set(terminal, "print", "Only add or remove toggle supported");
                    break;
                }
            }
            if (modified) {
                access.name = userItem.name;
                access.email = userItem.email;
                await user.access.set(access, userItem.user);
                core.property.set(terminal, "insert", " - Changed");
            }
            userIndex++;
        }
        core.cmd.exit(terminal);
    };
};
