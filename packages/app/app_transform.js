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
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.window(object);
            window.prevLanguage = null;
            me.ui.options.load(me, window, {
                doTranslation: true,
                addStyles: true,
                keepSource: false,
                showHtml: false,
                showInput: false,
                autoScroll: false,
                snapToPage: true,
                headings: true,
                pages: true,
                columns: true,
                language: "Auto",
                fontSize: "24px",
                scrollPos: 0
            });
            window.pageSize = {width: 0, height: 0};
            window.options.autoScroll = false;
            me.translation = me.ui.options.toggleSet(me, "doTranslation", me.transform.set);
            me.addStyles = me.ui.options.toggleSet(me, "addStyles", me.transform.set);
            me.keepSource = me.ui.options.toggleSet(me, "keepSource", me.transform.set);
            me.showHtml = me.ui.options.toggleSet(me, "showHtml", me.transform.set);
            me.showInput = me.ui.options.toggleSet(me, "showInput", function (object, options, key, value) {
                var window = me.widget.window.window(object);
                if (!me.get(window.var.layout, "ui.basic.text")) {
                    value = true;
                }
                me.updateWidgets(window, value);
            });
            me.autoScroll = me.ui.options.toggleSet(me, "autoScroll", me.updateScrolling);
            me.snapToPage = me.ui.options.toggleSet(me, "snapToPage", me.updateScrolling);
            me.language = me.ui.options.choiceSet(me, "language", me.transform.set);
            me.fontSize = me.ui.options.choiceSet(me, "fontSize", function (object, options, key, value) {
                var window = me.widget.window.window(object);
                me.set(window.var.layout, "ui.style.fontSize", value);
                window.forceReflow = true;
                me.set(window, "update");
            });
            me.pages = me.ui.options.toggleSet(me, "pages", me.reflow.set);
            me.columns = me.ui.options.toggleSet(me, "columns", me.reflow.set);
            me.headings = me.ui.options.toggleSet(me, "headings", me.transform.set);
            me.scrollPos = me.ui.options.choiceSet(me, "scrollPos");
            me.ui.theme.useStylesheet("kab.terms");
        }
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = me.widget.window.window(object);
        me.set(window.var.input, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(window.var.transform, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(window.var.layout, "ui.style.top", showInput ? "250px" : "0px");
        me.set(window.var.layout, "ui.style.borderTop", showInput ? "1px solid black" : "none");
        me.set(window.var.layout, "ui.style.fontSize", window.options.fontSize);
        if (update) {
            me.set(window, "update");
    }
    };
    me.shouldReflow = function (object) {
        var window = me.widget.window.window(object);
        var reflow = false;
        var pageSize = me.ui.layout.pageSize(window.var.layout);
        if (me.get(window, "visible")) {
            if (window.pageSize && (pageSize.height !== window.pageSize.height || pageSize.width !== window.pageSize.width)) {
                reflow = true;
            }
            if (window.forceReflow) {
                reflow = true;
            }
        }
        return reflow;
    };
    me.work = {
        set: function (object, value) {
            if (value) {
                me.set(object.var.spinner, "ui.style.visibility", "visible");
                object.var.layout.style.opacity = 0;
            } else {
                me.set(object.var.spinner, "ui.style.visibility", "hidden");
                object.var.layout.style.opacity = 1;
                me.updateScrolling(object);
            }
        }
    };
    me.updateScrolling = function (object) {
        var window = me.widget.window.window(object);
        var scrollbar = window.var.layout.var.vertical;
        var pageSize = me.ui.layout.pageSize(window.var.layout);
        var snapToPage = window.options.snapToPage;
        if (!window.options.pages) {
            snapToPage = false;
        }
        me.set(scrollbar, "snapToPage", snapToPage);
        me.set(scrollbar, "pageSize", pageSize.height);
        me.set(scrollbar, "autoScroll", window.options.autoScroll);
        me.set(scrollbar, "scrollTo", window.options.scrollPos);
        me.set(scrollbar, "snap");
    };
    me.save = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            var input = window.var.input;
            me.set(input, "storage.cache.store", me.get(input, "ui.basic.text"));
        }
    };
    me.new = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.set(window.var.input, "ui.basic.text", "");
            me.set(window.var.input, "storage.cache.store", "");
            me.set(window.var.output, "ui.basic.html", "");
            me.ui.layout.clear(window.var.layout);
            me.updateWidgets(window, true);
            window.options.scrollPos = 0;
        }
    };
    me.transform = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.ui.layout.clear(window.var.layout);
            var text = me.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (text) {
                me.set(window, "ui.work.state", true);
                window.contentChanged = true;
                var language = window.options.language.toLowerCase();
                if (language === "auto") {
                    language = me.core.string.language(text);
                    console.log("detected language: " + language);
                }
                var beforeConversion = performance.now();
                me.set(window.var.footer, "ui.style.display", "block");
                me.set(window.var.footer, "ui.basic.text", "Transforming...");
                me.kab.terms.setLanguage(function (numTerms) {
                    me.kab.terms.parse(function (text) {
                        if (window.prevLanguage) {
                            me.set(window.var.layout, "ui.theme.remove", window.prevLanguage);
                        }
                        me.set(window.var.layout, "ui.theme.add", language);
                        window.prevLanguage = language;
                        if (window.options.showHtml) {
                            me.set(window.var.output, "ui.basic.text", text);
                        } else {
                            me.set(window.var.output, "ui.basic.html", text);
                        }
                        me.ui.layout.move(window.var.output, window.var.layout);
                        window.forceReflow = true;
                        me.set(window, "update");
                        var afterConversion = performance.now();
                        me.set(window.var.footer, "ui.basic.text", "Transformation took " + (afterConversion - beforeConversion).toFixed() + " milliseconds. Using " + numTerms + " term combinations in " + language);
                        setTimeout(function () {
                            me.set(window.var.footer, "ui.basic.text", "");
                        }, 5000);
                        me.set(window, "ui.work.state", false);
                    }, text, window.options);
                }, language);
            }
        }
    };
    me.reflow = {
        set: function (object) {
            var window = me.widget.window.window(object);
            window.forceReflow = true;
            me.set(window, "update");
        }
    };
    me.update = {
        set: function (object) {
            var window = me.widget.window.window(object);
            if (!me.shouldReflow(object)) {
                return;
            }
            var visibleWidget = null;
            if (!window.contentChanged) {
                visibleWidget = me.ui.layout.firstVisibleWidget(window.var.layout);
            }
            window.forceReflow = false;
            window.contentChanged = false;
            window.pageSize = me.ui.layout.pageSize(window.var.layout);
            me.set(window, "ui.work.state", true);
            var target = me.widget.container.content(window.var.layout);
            window.var.layout.style.opacity = 0;
            if (window.options.pages) {
                target.style.margin = "";
            } else {
                target.style.margin = "20px 40px";
            }
            var columnCount = window.options.columns ? 2 : 1;
            var reflowOptions = {
                pageClass: "app.transform.page",
                contentClass: "app.transform.page.content",
                headerClass: "app.transform.page.header",
                pageNumberClass: "app.transform.page.number",
                scrollToTopClass: "app.transfer.page.scrolltotop",
                usePages: window.options.pages,
                columnCount: columnCount,
                scrollWidget: visibleWidget,
                scrollPos: window.options.scrollPos
            };
            me.ui.layout.reflow(function () {
                me.set(window, "ui.work.state", false);
            }, window.var.output, window.var.layout, reflowOptions);
        }
    };
    me.scrolled = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            if (me.get(window, "ui.work.state")) {
                return;
            }
            if ("vertical" in value) {
                me.set(window, "app.transform.scrollPos", value.vertical);
            }
        }
    };
    me.inputCacheKey = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var key = me.get(window, "key");
            return "app-transform-input-" + key;
        }
    };
    me.windowCacheKey = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var key = me.get(window, "key");
            return "app-transform-window-" + key;
        }
    };
};
