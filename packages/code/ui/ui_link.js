/*
 @author Zakai Hamilton
 @component UILink
 */

screens.ui.link = function UILink(me) {
    me.init = async function () {
        window.addEventListener("click", me.handleClick);
    };
    me.handleClick = function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPreventented) {
            return true;
        }
        var anchor = null;
        for (var n = event.target; n.parentNode; n = n.parentNode) {
            if (n.nodeName === "A") {
                anchor = n;
                break;
            }
        }
        if (!anchor) return true;

        var href = anchor.getAttribute("href");
        if (!href || !href.startsWith("/")) {
            return true;
        }
        event.preventDefault();

        var query = "";
        var url = href;
        var query_offset = href.lastIndexOf("?");
        if (query_offset !== -1) {
            url = href.substring(0, query_offset);
            query = href.substring(query_offset + 1);
        }
        url = decodeURIComponent(url);
        query = me.core.http.parse_query(query);

        if (url.startsWith("/")) {
            url = url.substring(1);
        }
        var args = [url];
        if (query.args) {
            let app_args = JSON.parse(me.core.string.decode(query.args));
            args.push(...app_args);
        }
        me.core.app.launch.apply(null, args).then((window) => {
            if (window) {
                me.core.property.set(window, "widget.window.show", true);
                me.core.property.set(window, "widget.window.maximize");
            }
        });

        return false;
    };
};