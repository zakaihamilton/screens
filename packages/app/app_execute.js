/*
 @author Zakai Hamilton
 @component AppExecute
 */

package.app.execute = function AppExecute(me) {
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "desktop", "self");
    };
    me.run = {
        set: function(object) {
            var code = me.get(me.singleton.var.editor, "ui.basic.text");
            var result = "";
            var isError = false;
            try {
                result = eval(code);
            }
            catch(e) {
                result = e.message;
                isError = true;
            }
            me.set(me.singleton.var.footer, "ui.style.display", "block");
            me.set(me.singleton.var.footer, "ui.style.background", isError ? "red" : "green");
            me.set(me.singleton.var.footer, "ui.basic.text", result);
        }
    };
};
