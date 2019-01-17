/*
 @author Zakai Hamilton
 @component UIScreenshot
 */

screens.ui.screenshot = function UIScreenshot(me) {
    me.init = async function () {
        me.html2canvas = await me.core.require.load(["/external/html2canvas.js"]);
    };
    me.capture = function (object) {
        var window = me.widget.window.get(object);
        var label = me.core.property.get(window, "widget.window.label");
        var content = me.widget.window.content(window);
        me.html2canvas(content).then(function (canvas) {
            var link = document.createElement("a");
            link.download = label;
            link.href = canvas.toDataURL("image/png");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };
};
