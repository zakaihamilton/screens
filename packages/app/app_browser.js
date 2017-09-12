/*
 @author Zakai Hamilton
 @component AppBrowser
 */

package.app.browser = function AppBrowser(me) {
    me.launch = function () {
        me.ui.element.create(__json__, "desktop", "self");
    };
    me.load = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var url = me.get(window.var.url, "text");
            if(!url.startsWith("www.")) {
                url = "www." + url;
            }
            if(!url.startsWith("http://")) {
                url = "http://" + url;
            }
            me.set(window.var.embed, "ui.basic.src", url);
            me.set(window, "title", "Browser - " + url.replace("http://www.", ""));
        }
    };
};
