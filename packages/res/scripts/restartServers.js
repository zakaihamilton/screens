var me = me, object = object, packages = packages;

async function run() {
    var { core, db } = packages;
    var servers = await db.events.servers.list({});
    var ipLisst = servers.map(server => server.ip).filter(Boolean);
    let results = [];
    for (let ip of ipList) {
        let commands = [
            "cd screens",
            "rm -rf cache/*",
            "git checkout package.json",
            "git pull",
            "npm install",
            "npm audit fix",
            "pm2 reload all --update-env",
            "exit"
        ];
        let cmd = "ssh root@" + ip + " '" + commands.join(";") + "'";
        results.push(await core.server.run(cmd));
    }
    me.output(object, "output.json", JSON.stringify(results), true);
}

run();