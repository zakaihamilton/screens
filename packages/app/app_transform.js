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
        me.set(me.singleton, "app.transform.convert");
    };
    me.init = function () {
        me.ui.property.initToggleOptions(me, {
            "doTranslation": true,
            "addStyles": true,
            "keepSource": false,
            "showHtml": false,
            "showInput": true,
            "autoScroll": false
        });
        me.translation = me.ui.property.toggleOptionSet(me, "doTranslation", me.convert.set);
        me.addStyles = me.ui.property.toggleOptionSet(me, "addStyles", me.convert.set);
        me.keepSource = me.ui.property.toggleOptionSet(me, "keepSource", me.convert.set);
        me.showHtml = me.ui.property.toggleOptionSet(me, "showHtml", me.convert.set);
        me.showInput = me.ui.property.toggleOptionSet(me, "showInput", function (options, key, value) {
            me.set(me.singleton.var.input, "ui.style.display", value ? "initial" : "none");
            me.set(me.singleton.var.convert, "ui.style.display", value ? "initial" : "none");
            me.set(me.singleton, "update");
        });
        me.autoScroll = me.ui.property.toggleOptionSet(me, "autoScroll", function (options, key, value) {
            var scrollbar = me.singleton.var.container.var.vertical;
            if(scrollbar) {
                me.set(scrollbar, "autoScroll", value);
            }
        });
    };
    me.new = {
        set: function (object) {
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.output, "ui.basic.html", "");
        }
    };
    me.convert = {
        set: function (object) {
            var text = me.get(me.singleton.var.input, "ui.basic.text");
            text = "<p>" + text.split("\n").map(function (paragraph) {
                return me.kab.terms.parse(paragraph, me.options);
            }).join("</p><p>") + "<br><br>";
            if (me.options.showHtml) {
                me.set(me.singleton.var.output, "ui.basic.text", text);
            } else {
                me.set(me.singleton.var.output, "ui.basic.html", text);
            }
            me.set(me.singleton, "update");
        }
    };
};
