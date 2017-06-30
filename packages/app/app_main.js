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
                "ui.style.user-select" : "none",
                "ui.style.cursor": "default"
            }
        ], me.ui.element.body());
        me.ui.element.create([
            {
                "ui.group.data": {
                    "ui.data.parent": me.ui.element.body(),
                    "ui.data.default": {"background": "radial-gradient(circle, red, yellow, green)"},
                    "ui.data.keys": ["title", "background", "ui.style.left", "ui.style.top", "ui.style.width", "ui.style.height"],
                    "ui.data.values": [["Root", "white", "330px", "80px"], ["First", "yellow", "300px", "300px"], ["Second", "blue", "500px", "600px"], ["Third", "red", "200px", "550px"], ["Fourth", "green", "900px", "550px", "200px", "200px"]]
                }
            },
            {
                "title": "Program Manager",
                "icon": "/packages/res/icons/program_manager.png",
                "ui.style.left": "550px",
                "ui.style.top": "150px",
                "ui.style.width": "300px",
                "ui.style.height": "250px",
                "widget.menu.items": [
                    ["File", [
                            ["New..."],
                            ["Open"],
                            ["Move..."],
                            ["Copy..."],
                            ["Delete"],
                            ["Properties"],
                            ["Run...", undefined, {"separator": true}],
                            ["Exit Windows...", undefined, {"separator": true}],
                        ]],
                    ["Options", [
                            ["Load on Startup", "app.main.check"]
                        ]],
                    ["Window", [
                            ["Games"],
                            ["Programs"],
                            ["Maximize","widget.window.maximize"],
                            ["Minimize","widget.window.minimize"],
                            ["Restore","widget.window.restore"]
                        ]],
                    ["Help", [
                            ["Contents"],
                            ["Search for Help on..."],
                            ["How to Use Help"],
                            ["Windows Tutorial"],
                            ["About Program Manager..."],
                        ]]
                ],
                "ui.basic.elements": [{
                        "ui.basic.text": "This is some text",
                        "ui.style.left": "80px",
                        "ui.style.width":"300px",
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
                    }, {
                        "ui.style.left": "250px",
                        "ui.style.top": "50px",
                        "title": "Main",
                        "background": "repeating-linear-gradient(white, gray 30%, black 50%, white)"
                    }, {
                        "ui.style.left": "500px",
                        "ui.style.top": "50px",
                        "title": "Games",
                        "background": "radial-gradient(circle, yellow, green, red)"
                    }]
            },
/*            {
                "title": "Convert",
                "icon": "/packages/res/icons/convert.png",
                "ui.style.left": "400px",
                "ui.style.top": "200px",
                "ui.style.width": "400px",
                "ui.style.height": "300px"
            }*/
        ]);
    };
    me.ok = {
        set: function (object, value) {
            me.send("app.main.test", "123");
        }
    };
    me.test = function (value) {
        alert("Hello!" + value);
    };
    me.check = {
        get: function (object) {
            var options = {"state": me.checked};
            return options;
        },
        set: function (object, value) {
            me.checked = !me.checked;
        }
    };
};
