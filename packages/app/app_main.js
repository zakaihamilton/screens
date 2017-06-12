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
    }
    me.ready = function () {
        me.ui.element.update([
            {
                "ui.style.background": "lightblue"
            },
        ], me.ui.element.body());
        me.ui.element.create([{
                "ui.group.data": {
                    "ui.data.type": ["title", "background", "ui.style.width", "ui.style.height"],
                    "ui.data.source": [["Root", "white", "100px"], ["First", "yellow", "300px"], ["Second", "blue"], ["Third", "red"], ["Fourth", "green", "200px", "200px"]]
                }
            }]);
        me.ui.element.create([{
                "title": "Program Manager",
                "ui.style.position": "absolute",
                "ui.style.left": "500px",
                "ui.style.top": "100px",
                "ui.style.width": "300px",
                "ui.style.height": "300px",
                "members": [{
                        "text": "This is some text",
                        "ui.style.left": "80px",
                        "ui.style.position": "relative",
                        "ui.style.top": "20px"
                    }, {
                        "text": "Hello",
                        "ui.event.pressed": "app.main.ok",
                        "ui.style.position": "relative",
                        "ui.style.left": "120px",
                        "ui.style.top": "170px"
                    }, {
                        "state": true,
                        "text": "Apple",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "text": "Orange",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "group": "together",
                        "text": "One",
                        "ui.style.left": "100px"
                    }, {
                        "state": true,
                        "group": "together",
                        "text": "Two",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "group": "fruit",
                        "text": "Banana",
                        "ui.style.left": "100px"
                    }, {
                        "state": true,
                        "group": "fruit",
                        "text": "Grapefruit",
                        "ui.style.left": "100px"
                    }]
            }]);
    };
    me.ok = function () {
        me.send("test", "123");
    }
    me.test = function (arg) {
        alert("Hello!" + arg);
    };
};
