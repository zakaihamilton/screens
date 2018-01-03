/*
 @author Zakai Hamilton
 @component AppBrowser
 */

package.app.browser = function AppBrowser(me) {
    me.launch = function () {
        return me.ui.element.create(__json__, "workspace", "self");
    };
    me.load = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var url = me.core.property.get(window.var.url, "text");
            if(!url.startsWith("www.")) {
                url = "www." + url;
            }
            if(!url.startsWith("http://")) {
                url = "http://" + url;
            }
            me.core.property.set(window.var.embed, "ui.basic.src", url);
            me.core.property.set(window, "title", "Browser - " + url.replace("http://www.", ""));
        }
    };
};
