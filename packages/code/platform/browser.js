// eslint-disable-next-line no-unused-vars
async function startBrowser(appName, appArgs) {
    var components = [];
    for (var the_package of screens.packages) {
        for (var component in screens[the_package]) {
            components.push({ package: the_package, component });
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
    await screens.core.startup.run();
}
