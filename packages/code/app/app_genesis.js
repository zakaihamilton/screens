/*
 @author Zakai Hamilton
 @component AppGenesis
 */

package.app.genesis = function AppGenesis(me) {
    me.launch = function () {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.update = function(object) {
        var window = me.widget.window(object);
        me.core.property.set(window.var.canvas, "fillText", {
            "text": "Hello World!",
            "font": "30px Ariel",
            "pos": {
                "x": 500,
                "y": 600
            }
        });
    };
};
