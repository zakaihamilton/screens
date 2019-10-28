/*
 @author Zakai Hamilton
 @component UIScreenshot
 */

screens.ui.screenshot = function UIScreenshot(me, { core, ui, widget }) {
    me.capture = async function (object) {
        var window = widget.window.get(object);
        var label = core.property.get(window, "widget.window.label");
        var content = widget.window.content(window);
        var altContent = ui.node.findByName(content, "content");
        var dataUrl = await domtoimage.toPng(altContent ? altContent : content);
        var link = document.createElement("a");
        link.download = label + ".png";
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return "browser";
};
