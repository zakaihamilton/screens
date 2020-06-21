global.platform = "server";

process.on("uncaughtException", (err) => {
    var fs = require("fs");
    var date = new Date();
    // eslint-disable-next-line no-console
    console.log("fatal error: " + date.toUTCString() + err.stack);
    fs.writeFileSync("crash.txt", "error: " + date.toUTCString() + err.stack);
});

const { setup } = require("./server/setup");
setup(() => {
    require("../screens");

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
        "lib.zoom.meetings"
    ];

    screens.apps = [
        "transform",
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
        "links"
    ];

    screens.requireAll(["packages/code"], ["platform", "app", "react"]).then(async components => {
        await screens.require(components);
        screens.core.file.alias.set("service_worker.js", "packages/code/platform/service_worker.js");
        screens.core.file.alias.set("webfonts", "node_modules/@fortawesome/fontawesome-free/webfonts");
        screens.core.startup.run();
    });
});