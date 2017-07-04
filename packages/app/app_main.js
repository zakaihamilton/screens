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
                "ui.group.data": {
                    "ui.data.parent": me.ui.element.body(),
                    "ui.data.default": {"ui.style.background": "radial-gradient(circle, red, yellow, green)"},
                    "ui.data.keys": ["title", "ui.style.background", "ui.style.left", "ui.style.top", "ui.style.width", "ui.style.height"],
                    "ui.data.values": [["Root", "white", "330px", "80px"], ["First", "yellow", "300px", "300px"], ["Second", "blue", "500px", "600px"], ["Third", "red", "200px", "550px"], ["Fourth", "green", "900px", "550px", "200px", "200px"]]
                }
            },
            {
                "title": "The Computer Chronicles - Windows 3.0 (1990)",
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
            },
            {
                "title": "Program Manager",
                "icon": "/packages/res/icons/program_manager.png",
                "ui.style.left": "950px",
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
                            ["Maximize", "widget.window.maximize"],
                            ["Minimize", "widget.window.minimize"],
                            ["Restore", "widget.window.restore"]
                        ]],
                    ["Help", [
                            ["Contents"],
                            ["Search for Help on..."],
                            ["How to Use Help"],
                            ["Windows Tutorial"],
                            ["About Program Manager..."],
                        ]]
                ],
                "ui.basic.elements": [
                    {
                        "ui.basic.text": "This is some text",
                        "ui.style.width": "200px",
                        "ui.basic.type": "text"
                    },
                    {
                        "state": true,
                        "ui.basic.text": "Two Words"
                    },
                    {
                        "ui.basic.text": "Hello",
                        "ui.event.click": "app.main.ok"
                    },
                    {
                        "ui.basic.text": "Drop Down List",
                        "ui.style.width": "300px",
                        "ui.element.count": 0,
                        "ui.basic.readOnly": true,
                        "ui.group.data": {
                            "ui.data.keys": ["state", "ui.basic.text"],
                            "ui.data.values": [
                                [false, "Option One"],
                                [false, "Option Two"],
                                [false, "Option Three"],
                                [false, "Option Four"],
                                [false, "Option Five"],
                                [false, "Option Six"],
                                [false, "Option Seven"],
                                [false, "Option Eight"],
                                [false, "Option Nine"],
                                [false, "Option Ten"]
                        ]
                        }
                    },
                    {
                        "state": false,
                        "ui.basic.text": "Orange"
                    },
                    {
                        "state": false,
                        "group": "together",
                        "ui.basic.text": "One"
                    },
                    {
                        "state": true,
                        "group": "together",
                        "ui.basic.text": "Two"
                    },
                    {
                        "state": false,
                        "group": "fruit",
                        "ui.basic.text": "Banana"
                    },
                    {
                        "state": true,
                        "group": "fruit",
                        "ui.basic.text": "Grapefruit"
                    },
                    {
                        "ui.style.left": "250px",
                        "ui.style.top": "50px",
                        "title": "Main",
                        "ui.style.background": "repeating-linear-gradient(white, gray 30%, black 50%, white)"
                    },
                    {
                        "ui.style.left": "500px",
                        "ui.style.top": "50px",
                        "title": "Games",
                        "ui.style.background": "radial-gradient(circle, yellow, green, red)"
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
