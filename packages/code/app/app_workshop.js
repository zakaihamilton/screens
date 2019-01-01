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
        me.core.property.set(me.singleton.var.users, "items", ["Mary", "Moshe", "Zakai"]);
        return me.singleton;
    };
    me.resize = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.container, "ui.style.overflow", "hidden");
        var target_region = me.ui.rect.absoluteRegion(window.var.container);
        var size = target_region.width > target_region.height ? target_region.height : target_region.width;
        me.core.property.set(window.var.users, {
            "ui.style.top": ((target_region.height - size) / 2) + "px",
            "ui.style.left": ((target_region.width - size) / 2) + "px",
            "ui.style.width": size + "px",
            "ui.style.height": size + "px",
            "redraw": null
        });
    };
};
