/*
 @author Zakai Hamilton
 @component AppExecute
 */

screens.app.execute = function AppExecute(me) {
    me.launch = function () {
        if(me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        return me.singleton;
    };
    me.run = {
        set: function(object) {
            var code = me.core.property.get(me.singleton.var.editor, "ui.basic.text");
            var result = "";
            var isError = false;
            try {
                result = eval(code);
            }
            catch(e) {
                result = e.message;
                isError = true;
            }
            me.core.property.set(me.singleton.var.footer, {
                "ui.style.display": "block",
                "ui.style.background": isError ? "red" : "green",
                "ui.basic.text": result
            });
        }
    };
};
