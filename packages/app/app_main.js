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
                "ui.style.background": "lightblue"
            }
        ], me.ui.element.body());
        me.ui.element.create([{
                "ui.basic.var": "tray",
                "ui.style.overflow": "hidden",
                "ui.style.left": "50px",
                "ui.style.bottom": "0px",
                "ui.style.position":"absolute"
            },
            {
                "ui.group.data": {
                    "ui.data.keys": ["title", "background", "ui.style.width", "ui.style.height"],
                    "ui.data.values": [["Root", "white", "100px"], ["First", "yellow", "300px"], ["Second", "blue"], ["Third", "red"], ["Fourth", "green", "200px", "200px"]]
                }
            },
            {
                "ui.style.position": "absolute",
                "title": "Program Manager",
                "icon" : "/packages/res/icons/program_manager.png",
                "ui.style.left": "500px",
                "ui.style.top": "100px",
                "ui.style.width": "300px",
                "ui.style.height": "300px",
                "ui.basic.elements": [{
                        "ui.basic.text": "This is some text",
                        "ui.style.left": "80px",
                        "ui.style.position": "relative",
                        "ui.style.top": "20px"
                    }, {
                        "ui.basic.text": "Hello",
                        "ui.event.click": "app.main.ok",
                        "ui.style.position": "relative",
                        "ui.style.left": "120px",
                        "ui.style.top": "170px"
                    }, {
                        "state": true,
                        "ui.basic.text": "Apple",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "ui.basic.text": "Orange",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "group": "together",
                        "ui.basic.text": "One",
                        "ui.style.left": "100px"
                    }, {
                        "state": true,
                        "group": "together",
                        "ui.basic.text": "Two",
                        "ui.style.left": "100px"
                    }, {
                        "state": false,
                        "group": "fruit",
                        "ui.basic.text": "Banana",
                        "ui.style.left": "100px"
                    }, {
                        "state": true,
                        "group": "fruit",
                        "ui.basic.text": "Grapefruit",
                        "ui.style.left": "100px"
                    }]
            }]);
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
