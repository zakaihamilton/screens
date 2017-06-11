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
                    "ui.data.type": ["ui.element.title", "ui.element.background", "ui.style.width", "ui.style.height"],
                    "ui.data.source": [["Root", "white", "300px"], ["First", "yellow", "300px"], ["Second", "blue"], ["Third", "red"],["Fourth", "green", "200px", "200px"]]
                }
            }]);
        me.ui.element.create([{
                "ui.element.title":"Program Manager",
                "ui.style.position":"absolute",
                "ui.style.left":"500px",
                "ui.style.top":"100px",
                "ui.style.width":"300px",
                "ui.style.height":"300px",
                "ui.element.members":[{
                    "ui.element.text": "This is some text",
                    "ui.style.left": "80px",
                    "ui.style.position": "relative",
                    "ui.style.top" :"20px"
                },{
                    "ui.element.text" : "OK",
                    "ui.event.pressed" : "app.main.ok",
                    "ui.style.position": "relative",
                    "ui.style.left" : "120px",
                    "ui.style.top": "170px"
                },{
                    "ui.element.state":true,
                    "ui.element.text":"Apple",
                    "ui.style.left":"100px"
                },{
                    "ui.element.state":false,
                    "ui.element.text":"Orange",
                    "ui.style.left":"100px"
                },{
                    "ui.element.state":true,
                    "ui.element.group":"together",
                    "ui.element.text":"One",
                    "ui.style.left":"100px"
                },{
                    "ui.element.state":false,
                    "ui.element.group":"together",
                    "ui.element.text":"Two",
                    "ui.style.left":"100px"
                }]
            }]);
    };
    me.ok = function() {
        me.send("test", "123");
    }
    me.test = function(arg) {
        alert("Hello!" + arg);
    };
};
