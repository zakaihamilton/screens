/*
 @author Zakai Hamilton
 @component AppMain
 */

package.app.main = new function () {
    var me = this;
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
        me.dropdown = package.ui.element.create({
            "ui.group.data":{
                "ui.data.type" : "ui.element.text",
                "ui.data.source": ["Apple","Banana","Orange","Apricot","Peach"]
            },
            "ui.event.pressed": "app.main.hello",
            "ui.style.backgroundColor": "lightgray"
        });
        package.ui.element.create({
            "ui.element.text": "Label",
            "ui.style.color": "red"
        });
        package.ui.element.create({
            "ui.element.group": "Selection",
            "ui.element.text": "Apple",
            "ui.element.checked": false,
        });
        package.ui.element.create({
            "ui.element.group": "Selection",
            "ui.element.text": "Banana",
            "ui.element.checked": true
        });
        package.ui.element.create({
            "ui.group.data":{
                "ui.data.type" : "ui.element.text",
                "ui.data.source": ["Apple","Banana","Orange","Apricot","Peach"]
            },
            "ui.element.count": 10,
            "ui.element.multiple": true
        });
        package.ui.element.create({
            "ui.element.text": "Editor",
            "ui.element.edit": true,
            "ui.element.rows": 5,
            "ui.element.columns": 50,
        });
        package.ui.element.create({
            "ui.element.component":"ui.text",
            "ui.element.text":"Container",
            "ui.group.data":{
                "ui.data.type" : "ui.element.text",
                "ui.data.source": ["Apple","Banana","Orange","Apricot","Peach"]
            },
        });
    };
    me.hello = function () {
        if (typeof me.button === "undefined") {
            me.button = package.ui.element.create({
                "ui.element.text": "Alert selection",
                "ui.event.pressed": "app.main.alert"});
        }
    };
    me.showme = function () {
        alert("Show me the money!");
    };
    me.alert = function () {
        alert("you have selected " + package.ui.element.get(me.dropdown, "ui.element.selection"));
    };
};
