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
        
        package.ui.element.create();
    };
};
