/*
 @author Zakai Hamilton
 @component UIMark
 */

screens.ui.mark = function UIMark(me) {
    me.widget = function (html, text) {
        if (html.includes("mark")) {
            html = html.replace(/<\/mark>/gi, "");
            html = html.replace(/<mark>/gi, "");
            html = html.replace(/<mark style="">/gi, "");
        }
        if (text) {
            var find = me.core.string.regex("/(" + me.core.string.escape(text) + ")", "gi");
            var replace = "<mark>$1</mark>";
            html = html.replace(find, replace);
        }
        return html;
    };
};
