global.platform = "server";

process.on("uncaughtException", (err) => {
    var fs = require("fs");
    var date = new Date();
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});

require("../screens");
require("../../../classes/core/core");
require("../../../classes/file/file");
require("../../../classes/test");

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
    "user.access.info",
    "user.access.appList",
    "user.access.get",
    "user.access.isAPIAllowed",
    "core.socket",
    "core.object",
    "core.console",
    "core.client",
    "storage.data",
    "storage.dropbox",
    "manager",
    "core.file",
    "db.library",
    "db.shared",
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

screens.requireAll(["packages/code"], ["platform", "app"]).then(async components => {
    await screens.require(components);
    screens.core.file.alias.set("service_worker.js", "packages/code/platform/service_worker.js");
    screens.core.file.alias.set("eve.js", "external/eve.min.js");
    screens.core.startup.run();
});
