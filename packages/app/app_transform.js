/*
 @author Zakai Hamilton
 @component AppTransform
 */

package.app.transform = function AppTransform(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "body", "self");
    };
    me.options = {
        "translation": true,
        "styles": true,
        "keepSource": true
    };
    me.translation = me.ui.property.toggleOptionSet(me.options, "translation");
    me.styles = me.ui.property.toggleOptionSet(me.options, "styles");
    me.keepSource = me.ui.property.toggleOptionSet(me.options, "keepSource");
    me.new = {
        set: function (object) {
            console.log("me.singleton.var.input: " + me.singleton.var.input);
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.output, "ui.basic.html", "");
        }
    };
    me.convert = {
        set: function (object) {
            var text = me.get(me.singleton.var.input, "ui.basic.text");
            if (me.options.translation) {
                text = text.split("\n").map(function (paragraph) {
                    return paragraph.split(".").map(function (sentence) {
                        return sentence.split(",").map(function (fragment) {
                            var words = fragment.split(" ");
                            me.kab.terms.parse(words, me.options);
                            return words.join(" ");
                        }).join(",");
                    }).join(".");
                }).join("<br>");
            }
            me.set(me.singleton.var.output, "ui.basic.html", text);
        }
    };
};
