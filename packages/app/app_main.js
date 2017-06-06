/*
    @author Zakai Hamilton
    @component AppMain
*/

package.app.main = new function() {
    this.browser = function() {
        /* run on the browser */
        package.core.console.log("browser is ready");
        package.core.message.send_client("app.main.client");
    };
    this.client = function() {
        /* run on the client */
        package.core.console.log("application is started");
        package.core.console.log(package.core.remote.test("a", "b", "c"));
        package.core.console.log(package.core.remote.return_number(5));
        package.core.console.log(package.core.remote.return_string("testing 1, 2, 3"));
        package.core.console.log(package.core.remote.return_map({a:1,b:2,c:3}));
        package.core.console.log(package.core.remote.return_array([5,6,7,8]));
        package.core.console.log(package["core.remote.return_array"]([5,6,7,8]));
        package.core.message.send_server("core.node.print", "Hello World!");
        
        package.core.message.send_browser("app.main.ready");
    }
    this.ready = function() {
        this.dropdown = package.ui.element.create({
            "ui.element.data":["Apple","Banana","Orange","Apricot","Peach"],
            "ui.event.pressed":"app.main.hello",
            "ui.style.backgroundColor":"lightgray"
        });
        package.ui.element.create({
            "ui.element.text":"Label",
            "ui.style.color":"red"
        });
        package.ui.element.create({
            "ui.element.group":"Selection",
            "ui.element.text":"Apple",
            "ui.element.checked":false,
        });
        package.ui.element.create({
            "ui.element.group":"Selection",
            "ui.element.text":"Banana",
            "ui.element.checked":true
        });
        package.ui.element.create({
            "ui.element.data":["Apple","Banana","Apricot"],
            "ui.element.count":10,
            "ui.element.multiple":true
        });
        package.ui.element.create({
            "ui.element.text":"Editor",
            "ui.element.edit":true,
            "ui.element.rows":5,
            "ui.element.columns":50,
        });
    };
    this.hello = function() {
        if(typeof this.button === "undefined") {
            this.button = package.ui.element.create({
                "ui.element.text":"Alert selection",
                "ui.event.pressed":"app.main.alert"});
        }
    };
    this.showme = function() {
        alert("Show me the money!");
    };
    this.alert = function() {
        alert("you have selected " + package.ui.element.get(this.dropdown, "ui.element.selection"));
    };
};
