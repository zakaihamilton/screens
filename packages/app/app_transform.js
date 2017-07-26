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
        me.singleton = me.ui.element.create(__json__, "desktop", "self");
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
            if(!me.get(me.singleton.var.output, "ui.basic.text")) {
                value = true;
            }
            me.set(me.singleton.var.input, "ui.style.display", value ? "inline-block" : "none");
            me.set(me.singleton.var.convert, "ui.style.display", value ? "inline-block" : "none");
            me.set(me.singleton, "update");
        });
        me.autoScroll = me.ui.property.toggleOptionSet(me, "autoScroll", function (options, key, value) {
            var scrollbar = me.singleton.var.container.var.vertical;
            if (scrollbar) {
                me.set(scrollbar, "autoScroll", value);
            }
        });
        me.ui.theme.useStylesheet("kab.terms");
    };
    me.new = {
        set: function (object) {
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.input, "storage.cache.storeLocal");
            me.set(me.singleton.var.output, "ui.basic.html", "");
            me.set(me.singleton.var.input, "ui.style.display", "inline-block");
            me.set(me.singleton.var.convert, "ui.style.display", "inline-block");
            me.set(me.singleton, "update");
        }
    };
    me.convert = {
        set: function (object) {
            var text = me.get(me.singleton.var.input, "ui.basic.text");
            if(text) {
                if(!me.options.showInput) {
                    me.set(me.singleton.var.input, "ui.style.display", "none");
                    me.set(me.singleton.var.convert, "ui.style.display", "none");
                }
                me.kab.terms.parse(function (text) {
                    text = "<p>" + text.split("\n").join("</p><p>") + "<br><br>";
                    if (me.options.showHtml) {
                        me.set(me.singleton.var.output, "ui.basic.text", text);
                    } else {
                        me.set(me.singleton.var.output, "ui.basic.html", text);
                    }
                    me.set(me.singleton, "update");
                }, text, me.options);
            }
        }
    };
};
