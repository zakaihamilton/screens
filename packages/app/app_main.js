/*
    @author Zakai Hamilton
    @component AppMain
*/

package.app.main = new function() {
    this.browser = function() {
        /* run on the browser */
        package.core.console.log("browser is ready");
        package.ui.element;
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
            "ui.element.data":["Apple","Banana","Apricot"],
            "ui.element.title":"Hello World!",
            "ui.event.pressed":"app.main.hello"});
        console.log("dropdown:" + this.dropdown);
    };
    this.hello = function() {
        if(typeof this.button === "undefined") {
            this.button = package.ui.element.create({
                "ui.element.title":"Alert selection",
                "ui.event.pressed":"app.main.alert"});
        }
    };
    this.alert = function() {
        alert("you have selected " + package.ui.element.get(this.dropdown, "ui.element.selection"));
    };
};
