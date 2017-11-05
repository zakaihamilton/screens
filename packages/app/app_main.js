/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = function (me) {
    me.setStartupApp = function(callback, appName) {
        me.the.appName = appName;
    };
    me.setStartupArgs = function(callback, appArgs) {
        me.the.appArgs = appArgs;
    };
    me.browser = function () {
        /* run on the browser */
        me.the.core.console.log("browser is ready");
        me.the.core.message.send_client("app.main.client");
    };
    me.client = function () {
        /* run on the client */
        me.the.core.console.log("application is started");
        me.the.core.test.test(me.the.core.console.log, "a", "b", "c");
        me.the.core.test.return_number(me.the.core.console.log, 5);
        me.the.core.test.return_string(me.the.core.console.log, "testing 1, 2, 3");
        me.the.core.test.return_map(me.the.core.console.log, {a: 1, b: 2, c: 3});
        me.the.core.test.return_array(me.the.core.console.log, [5, 6, 7, 8]);
        package.path("core.test.return_array")(me.the.core.console.log, [5, 6, 7, 8]);
        me.the.core.message.send_browser("app.main.ready");
    };
    me.ready = function () {
        me.the.ui.element.create([
            {
                "ui.element.component":"widget.desktop",
                "ui.basic.var":"desktop"
            }
        ]);
        package.include("app.progman", function(info) {
            if(info.complete) {
                me.the.core.message.send("app.progman.launch");
                if(me.the.appName) {
                    me.the.core.app.launch(null, me.the.appName, me.the.appArgs);
                }
                else {
                    package.include("app.cache", function(info) {
                        if(info.complete) {
                            me.the.core.message.send("app.cache.launch");
                            package.include({"app":["transform","diagram"]}, function(info) {
                                if(info.complete) {
                                    me.the.core.message.send("app.transform.launch");
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    me.ok = {
        set: function (object, value) {
            me.the.core.message.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
};
