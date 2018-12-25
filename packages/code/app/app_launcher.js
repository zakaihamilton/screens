/*
 @author Zakai Hamilton
 @component AppLauncher
 */

screens.app.launcher = function AppLauncher(me) {
    me.launch = function () {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.html = function () {
        return __html__;
    };
    me.resIcon = async function (object, value) {
        var name = null, extension = null, label = null;
        if (typeof value === "string") {
            label = value;
            name = value.toLowerCase();
        }
        else if (Array.isArray(value)) {
            label = value[0];
            name = value[0].toLowerCase();
            extension = value[1];
        }
        if (!extension) {
            extension = "png";
        }
        var available = me.core.app.available(name);
        me.core.property.set(object, "text", label);
        me.core.property.set(object, "ui.basic.src", `/packages/res/icons/${name}.${extension}`);
        me.core.property.set(object, "ui.basic.display", available);
        me.core.property.set(object, "ui.touch.click", "core.app." + name);
    };
};
