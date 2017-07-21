/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = function (me) {
    me.browser = function () {
        /* run on the browser */
        me.core.console.log("browser is ready");
        me.core.message.send_client("app.main.client");
    };
    me.client = function () {
        /* run on the client */
        me.core.console.log("application is started");
        me.core.console.log(me.core.remote.test("a", "b", "c"));
        me.core.console.log(me.core.remote.return_number(5));
        me.core.console.log(me.core.remote.return_string("testing 1, 2, 3"));
        me.core.console.log(me.core.remote.return_map({a: 1, b: 2, c: 3}));
        me.core.console.log(me.core.remote.return_array([5, 6, 7, 8]));
        me.core.console.log(package["core.remote.return_array"]([5, 6, 7, 8]));
        me.core.message.send_server("core.node.print", "Hello World!");
        me.core.message.send_browser("app.main.ready");
    };
    me.ready = function () {
        me.ui.element.create([
            {
                "ui.element.component":"widget.desktop"
            }
        ]);
        package.include("app.progman", function(failure) {
            if(!failure) {
                me.set(me.send("app.progman.launch"), "minimize", true);
            }
        });
        package.include("app.transform", function(failure) {
            if(!failure) {
                me.send("app.transform.launch");
            }
        });
    };
    me.ok = {
        set: function (object, value) {
            me.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
};
