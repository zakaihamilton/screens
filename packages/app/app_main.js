/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = function (me) {
    me.setStartupApp = function(callback, appName) {
        me.appName = appName;
    };
    me.setStartupArgs = function(callback, appArgs) {
        me.appArgs = appArgs;
    };
    me.browser = function () {
        /* run on the browser */
        me.core.console.log("browser is ready");
        me.core.message.send_client("app.main.client");
    };
    me.client = function () {
        /* run on the client */
        me.core.console.log("application is started");
        me.core.test.test(me.core.console.log, "a", "b", "c");
        me.core.test.return_number(me.core.console.log, 5);
        me.core.test.return_string(me.core.console.log, "testing 1, 2, 3");
        me.core.test.return_map(me.core.console.log, {a: 1, b: 2, c: 3});
        me.core.test.return_array(me.core.console.log, [5, 6, 7, 8]);
        package.path("core.test.return_array")(me.core.console.log, [5, 6, 7, 8]);
        me.core.message.send_browser("app.main.ready");
    };
    me.ready = function () {
        me.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        package.include("app.progman", function(info) {
            if(info.complete) {
                me.core.message.send("app.progman.launch");
                if(me.appName) {
                    me.core.app.launch(null, me.appName, me.appArgs);
                }
            }
        });
    };
    me.ok = {
        set: function (object, value) {
            me.core.message.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
};
