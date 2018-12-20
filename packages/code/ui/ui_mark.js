/*
 @author Zakai Hamilton
 @component UIMark
 */

screens.ui.mark = function UIMark(me) {
    me.widget = function (widget, text) {
        if (widget.innerHTML.includes("mark")) {
            widget.innerHTML = widget.innerHTML.replace(/<\/mark>/gi, "");
            widget.innerHTML = widget.innerHTML.replace(/<mark>/gi, "");
            widget.innerHTML = widget.innerHTML.replace(/<mark style=\"\">/gi, "");
        }
        if (text) {
            var find = me.core.string.regex("/(" + me.core.string.escape(text) + ")", 'gi');
            var replace = "<mark>$1</mark>";
            widget.innerHTML = widget.innerHTML.replace(find, replace);
        }
    };
};
