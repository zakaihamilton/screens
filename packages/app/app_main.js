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
        me.ui.element.update([
            {
                "ui.style.background": "lightblue",
                "ui.style.user-select": "none",
                "ui.style.cursor": "default"
            }
        ], me.ui.element.body());
        me.ui.element.create([
            {
                "title": "The Computer Chronicles",
                "ui.style.left": "550px",
                "ui.style.top": "200px",
                "ui.style.width": "300px",
                "ui.style.height": "300px",
                "icon": "https://www.youtube.com/yts/img/favicon_32-vfl8NGn4k.png",
                "ui.basic.elements": [
                    {
                        "ui.element.component": "widget.embed",
                        "ui.basic.src": "https://www.youtube.com/embed/YewNEAIkbG4?ecver=1",
                        "ui.attribute.allowFullScreen": ""
                    }
                ]
            }
        ]);
        package.include("app.progman", function(failure) {
            if(!failure) {
                me.send("app.progman.launch");
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
