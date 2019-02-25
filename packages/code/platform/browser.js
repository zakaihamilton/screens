async function startBrowser(appName, appArgs) {
    var components = [];
    for (var package of screens.packages) {
        for (var component in screens[package]) {
            components.push({ package, component });
        }
    }
    await screens.require(components);
    var args = screens.core.string.decode(appArgs);
    if (args) {
        args = JSON.parse(args);
    }
    screens.core.startup.app = {
        name: appName,
        params: args
    };
    screens.core.message.worker.load("packages/code/platform/client.js");
    await screens.core.message.service_worker.load("/service_worker.js");
    screens.core.startup.run();
}
