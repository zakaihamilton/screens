/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = function (me) {
    me.browser = function () {
        /* run on the browser */
        package.core.console.log("browser is ready");
        package.core.message.send_client("app.main.client");
    };
    me.client = function () {
        /* run on the client */
        package.core.console.log("application is started");
        package.core.console.log(package.core.remote.test("a", "b", "c"));
        package.core.console.log(package.core.remote.return_number(5));
        package.core.console.log(package.core.remote.return_string("testing 1, 2, 3"));
        package.core.console.log(package.core.remote.return_map({a: 1, b: 2, c: 3}));
        package.core.console.log(package.core.remote.return_array([5, 6, 7, 8]));
        package.core.console.log(package["core.remote.return_array"]([5, 6, 7, 8]));
        package.core.message.send_server("core.node.print", "Hello World!");

        package.core.message.send_browser("app.main.ready");
    }
    me.ready = function () {
        package.ui.element.update([
            {
                "ui.style.background": "lightblue"
            },
        ], package.ui.element.body());
        package.ui.element.create([{
                "ui.group.data": {
                    "ui.data.type": ["ui.element.title", "ui.element.background", "ui.style.width", "ui.style.height"],
                    "ui.data.source": [["Root", "white", "300px"], ["First", "yellow", "300px"], ["Second", "blue"], ["Third", "red"], ["Fourth", "green", "200px", "200px"]]
                }
            }]);
        package.ui.element.create([{
                "ui.element.title":"Program Manager",
                "ui.style.position":"absolute",
                "ui.style.left":"500px",
                "ui.style.top":"100px",
                "ui.style.width":"300px",
                "ui.element.members":[{
                    "ui.element.text": "This is some text",
                    "ui.style.left": "80px",
                    "ui.style.position": "relative",
                    "ui.style.top" :"20px"
                },{
                    "ui.element.text" : "OK",
                    "ui.event.pressed" : "app.main.ok",
                    "ui.style.position": "relative",
                    "ui.style.left" : "20px",
                    "ui.style.top": "60px"
                }]
            }]);
    };
    me.ok = function() {
        alert("Hello!");
    };
};
