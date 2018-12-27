/*
 @author Zakai Hamilton
 @component AppVersion
 */

screens.app.version = function AppVersion(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
    me.version = async function () {
        var json = await me.core.json.loadFile("/package.json");
        return json.version;
    };
    me.date = function () {
        return me.core.server.date();
    };
};
