/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = function (me) {
    me.setStartupApp = function(callback, appName) {
        me.package.appName = appName;
    };
    me.setStartupArgs = function(callback, appArgs) {
        me.package.appArgs = appArgs;
    };
    me.browser = function () {
        /* run on the browser */
        me.package.core.console.log("browser is ready");
        me.package.core.message.send_client("app.main.client");
    };
    me.client = function () {
        /* run on the client */
        me.package.core.console.log("application is started");
        me.package.core.test.test(me.package.core.console.log, "a", "b", "c");
        me.package.core.test.return_number(me.package.core.console.log, 5);
        me.package.core.test.return_string(me.package.core.console.log, "testing 1, 2, 3");
        me.package.core.test.return_map(me.package.core.console.log, {a: 1, b: 2, c: 3});
        me.package.core.test.return_array(me.package.core.console.log, [5, 6, 7, 8]);
        package.path("core.test.return_array")(me.package.core.console.log, [5, 6, 7, 8]);
        me.package.core.message.send_browser("app.main.ready");
    };
    me.ready = function () {
        me.package.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        package.include("app.progman", function(info) {
            if(info.complete) {
                me.package.core.message.send("app.progman.launch");
                if(me.package.appName) {
                    me.package.core.app.launch(null, me.package.appName, me.package.appArgs);
                }
            }
        });
    };
    me.ok = {
        set: function (object, value) {
            me.package.core.message.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
};
