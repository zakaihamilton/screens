/*
 @author Zakai Hamilton
 @component AppLauncher
 */

screens.app.launcher = function AppLauncher(me) {
    me.launch = function (args) {
        return me.ui.element(__json__, "workspace", "self");
    };
    me.html = function () {
        return __html__;
    };
    me.resIcon = async function (object, value) {
        const name = value.toLowerCase();
        me.core.property.set(object, "text", value);
        me.core.property.set(object, "ui.basic.src", `/packages/res/icons/${name}.png`);
        me.core.property.set(object, "ui.basic.display", false);
        me.core.property.set(object, "ui.touch.click", "core.app." + name);
        var available = await me.user.access.isAppAvailable(name);
        me.core.property.set(object, "ui.property.after", {
            "ui.basic.display": available,
            "timeout":100
        });
    };
};
