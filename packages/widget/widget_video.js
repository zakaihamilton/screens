/*
 @author Zakai Hamilton
 @component WidgetVideo
 */

package.widget.video = function WidgetVideo(me) {
    me["ui.element.default"] = {
        "ui.basic.tag":"video",
        "ui.attribute.controls":"",
        "ui.attriubte.preload":"auto",
        "ui.basic.elements":{
            "ui.basic.tag":"source",
            "ui.basic.var":"source"
        }
    };
    me.source = {
        set: function(object, path) {
            var extension = me.core.path.extension(path);
            me.core.property.set(object.var.source, "ui.attribute.src", path);
            me.core.property.set(object.var.source, "ui.attribute.type", "video/"+extension);
            object.src = path;
            object.load();
        }
    };
};
