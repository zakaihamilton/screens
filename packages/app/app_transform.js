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
        "keepSource": false,
        "showHtml":false,
        "showInput":true
    };
    me.init = function() {
        me.translation = me.ui.property.toggleOptionSet(me.options, "translation", me.convert.set);
        me.styles = me.ui.property.toggleOptionSet(me.options, "styles", me.convert.set);
        me.keepSource = me.ui.property.toggleOptionSet(me.options, "keepSource", me.convert.set);
        me.showHtml = me.ui.property.toggleOptionSet(me.options, "showHtml", me.convert.set);
        me.showInput = me.ui.property.toggleOptionSet(me.options, "showInput", function(options, key, value) {
            me.set(me.singleton.var.input, "ui.style.display", value ? "block" : "none");
        });
    }
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
            text = text.split("\n").map(function (paragraph) {
                return paragraph.split(".").map(function (sentence) {
                    return sentence.split(",").map(function (fragment) {
                        var words = fragment.split(" ");
                        me.kab.terms.parse(words, me.options.styles, me.options.keepSource, me.options.translation);
                        return words.join(" ");
                    }).join(",");
                }).join(".");
            }).join("<br>");
            if(me.options.showHtml) {
                me.set(me.singleton.var.output, "ui.basic.text", text);
            }
            else {
                me.set(me.singleton.var.output, "ui.basic.html", text);
            }
        }
    };
};
