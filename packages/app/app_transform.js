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
        me.prevLanguage = null;
        me.ui.property.initOptions(me, {
            doTranslation: true,
            addStyles: true,
            keepSource: false,
            showHtml: false,
            showInput: false,
            autoScroll: false,
            language:"Auto",
            "fontSize":"24px"
        });
        me.translation = me.ui.property.toggleOptionSet(me, "doTranslation", me.convert.set);
        me.addStyles = me.ui.property.toggleOptionSet(me, "addStyles", me.convert.set);
        me.keepSource = me.ui.property.toggleOptionSet(me, "keepSource", me.convert.set);
        me.showHtml = me.ui.property.toggleOptionSet(me, "showHtml", me.convert.set);
        me.showInput = me.ui.property.toggleOptionSet(me, "showInput", function (options, key, value) {
            if(!me.get(me.singleton.var.output, "ui.basic.text")) {
                value = true;
            }
            me.updateWidgets(value);
        });
        me.autoScroll = me.ui.property.toggleOptionSet(me, "autoScroll", function (options, key, value) {
            var scrollbar = me.singleton.var.output_container.var.vertical;
            if (scrollbar) {
                me.set(scrollbar, "autoScroll", value);
            }
        }, null);
        me.language = me.ui.property.choiceOptionSet(me, "language", me.convert.set);
        me.fontSize = me.ui.property.choiceOptionSet(me, "fontSize", function(options, key, value) {
            me.set(me.singleton.var.output, "ui.style.fontSize", value);
        });
        me.ui.theme.useStylesheet("kab.terms");
    };
    me.updateWidgets = function(showInput) {
        me.set(me.singleton.var.input, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(me.singleton.var.convert, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(me.singleton.var.output_container, "ui.style.top", showInput ? "250px" : "0px");
        me.set(me.singleton.var.output_container, "ui.style.borderTop", showInput ? "1px solid black" : "none");
        me.set(me.singleton.var.output, "ui.style.fontSize", me.options.fontSize);
        me.set(me.singleton, "update");
    };
    me.new = {
        set: function (object) {
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.input, "storage.cache.storeLocal");
            me.set(me.singleton.var.output, "ui.basic.html", "");
            me.updateWidgets(true);
            me.set(me.singleton, "update");
        }
    };
    me.convert = {
        set: function (object) {
            var text = me.get(me.singleton.var.input, "ui.basic.text");
            if(text) {
                me.updateWidgets(me.options.showInput);
                var language = me.options.language.toLowerCase();
                if(language === "auto") {
                    language = me.core.string.language(text);
                    console.log("detected language: " + language);
                }
                var spinner = "<div class=\"app-transform-spinner\"></div>";
                me.set(me.singleton.var.output, "ui.basic.html", spinner);
                me.kab.terms.setLanguage(function() {
                    me.kab.terms.parse(function (text) {
                        if(me.prevLanguage) {
                            me.set(me.singleton.var.output, "ui.theme.remove", me.prevLanguage);
                        }
                        me.set(me.singleton.var.output, "ui.theme.add", language);
                        me.prevLanguage = language;
                        if (me.options.showHtml) {
                            me.set(me.singleton.var.output, "ui.basic.text", text);
                        } else {
                            me.set(me.singleton.var.output, "ui.basic.html", text);
                        }
                        me.set(me.singleton, "update");
                    }, text, me.options);
                }, language);
            }
        }
    };
};
