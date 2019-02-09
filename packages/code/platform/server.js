global.platform = "server";

process.on("uncaughtException", (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});

require("../screens.js");

screens.admins = [
    "Zakai Hamilton",
    "Yochanan Mariano Perez"
];

screens.api = [
    "user.profile.get",
    "user.profile.set",
    "user.verify.match",
    "user.access.userId",
    "user.access.admin",
    "user.access.appList",
    "user.access.get",
    "user.access.isAPIAllowed",
    "core.socket",
    "core.object",
    "core.console",
    "storage.data",
    "storage.file",
    "manager",
    "core.file",
    "db.library",
    "db.shared",
    "db.commentary",
    "db.events",
    "db.cache",
    "media.file",
    "lib.zoom.meetingInfo",
    "lib.zoom.participants"
];

screens.apps = [
    "transform",
    "present",
    "profile",
    "theme",
    "login",
    "logger",
    "cache",
    "launcher",
    "diagram",
    "letters",
    "keyboard",
    "tasks",
    "prism",
    "table",
    "notes",
    "links",
    "visualize"
];

async function requireAll(root, exclude) {
    var fs = require("fs");
    var components = [];
    var names = fs.readdirSync(root);
    for (var name of names) {
        var path = root + "/" + name;
        var isDirectory = fs.statSync(path).isDirectory();
        if (isDirectory) {
            if (exclude && exclude.includes(name)) {
                continue;
            }
            components.push(... await requireAll(path));
        }
        if (name.endsWith(".js")) {
            var module = path.split(".")[0].replace("packages", "..");
            var [package, component] = name.split(".")[0].split("_");
            if (!component) {
                continue;
            }
            if (!screens[package]) {
                screens[package] = {};
            }
            components.push({ package, component, module });
        }
    }
    return components;
}

requireAll("packages/code", ["platform", "app"]).then(async components => {
    await screens.require(components);
    screens.core.file.alias.set("service_worker.js", "packages/code/platform/service_worker.js");
    screens.core.file.alias.set("eve.js", "external/eve.min.js");
    screens.core.startup.run();
});
