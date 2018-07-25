/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me) {
    me.element = {
        properties : __json__
    };
    me.shortcut = function(object, name) {
        return [[
            me.core.string.cammelCase(name),
            "/packages/res/icons/" + name + ".png",
            name,
            "core.app." + name
        ]];
    };
};
