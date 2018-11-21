/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me) {
    me.element = {
        properties : __json__
    };
    me.shortcut = function(object, name) {
        var method = method = "core.app." + name;
        var label = name;
        if(name.includes(".")) {
            method = name;
            label = name.split(".").pop();
        }
        return [[
            me.core.string.title(label),
            "/packages/res/icons/" + label + ".png",
            label,
            method
        ]];
    };
};
