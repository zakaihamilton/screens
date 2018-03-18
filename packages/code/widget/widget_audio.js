/*
 @author Zakai Hamilton
 @component WidgetAudio
 */

package.widget.audio = function WidgetAudio(me) {
    me.properties = {
        "ui.basic.tag":"audio",
        "ui.attribute.controls":"",
        "ui.attribute.preload":"auto",
        "ui.basic.elements":{
            "ui.basic.tag":"source",
            "ui.basic.var":"source"
        }
    };
    me.source = {
        set: function(object, path) {
            var extension = me.core.path.extension(path);
            me.core.property.set(object.var.source, "ui.attribute.src", path);
            if(extension === "mp3") {
                extension = "mpeg";
            }
            me.core.property.set(object.var.source, "ui.attribute.type", "audio/"+extension);
            object.src = path;
            object.load();
        }
    };
};
