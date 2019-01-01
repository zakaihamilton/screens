/*
 @author Zakai Hamilton
 @component AppWorkshop
 */

screens.app.workshop = function AppWorkshop(me) {
    me.init = async function () {

    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        me.core.property.set(me.singleton, "app", me);
        me.core.property.set(me.singleton.var.users, {
            "items": ["Mary", "Moshe", "Zakai", "Mark", "Andie", "Aria", "Yossi", "Robben"],
            "navigate": "app.workshop.navigate",
            "options": {
                spreaderInTitle: "Workshop",
                spreaderOutTitle: "Workshop",
                spreaderRadius: 100
            }
        });
        return me.singleton;
    };
    me.navigate = function (object, index) {

    };
    me.resize = function (object) {
        var window = me.widget.window.get(object);
        me.ui.resize.centerWidget(window.var.users);
    };
};
