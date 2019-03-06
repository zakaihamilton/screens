/*
 @author Zakai Hamilton
 @component AppBrowser
 */

screens.app.browser = function AppBrowser(me, packages) {
    const { core, ui, widget } = packages;
    me.launch = function () {
        return ui.element.create(me.json, "workspace", "self");
    };
    me.load = {
        set: function (object) {
            var window = widget.window.get(object);
            var url = core.property.get(window.var.url, "text");
            if (!url.startsWith("www.")) {
                url = "www." + url;
            }
            if (!url.startsWith("http://")) {
                url = "http://" + url;
            }
            core.property.set(window.var.embed, "ui.basic.src", url);
            core.property.set(window, "name", url.replace("http://www.", ""));
        }
    };
};
