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
        me.singleton.inTransition = 0;
        console.log("me.singleton.inTransition set to " + me.singleton.inTransition);
        me.link("update", "app.transform.update", true, me.singleton);
        me.link("scrolled", "app.transform.scrolled", true, me.singleton.var.layout);
        me.set(me.singleton, "app.transform.transform");
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
            snapToPage:true,
            headings: true,
            pages: true,
            columns: true,
            language: "Auto",
            fontSize: "24px",
            scrollPos:0
        });
        me.pageSize = {width:0,height:0};
        me.options.autoScroll = false;
        me.translation = me.ui.property.toggleOptionSet(me, "doTranslation", me.transform.set);
        me.addStyles = me.ui.property.toggleOptionSet(me, "addStyles", me.transform.set);
        me.keepSource = me.ui.property.toggleOptionSet(me, "keepSource", me.transform.set);
        me.showHtml = me.ui.property.toggleOptionSet(me, "showHtml", me.transform.set);
        me.showInput = me.ui.property.toggleOptionSet(me, "showInput", function (options, key, value) {
            if (!me.get(me.singleton.var.layout, "ui.basic.text")) {
                value = true;
            }
            me.updateWidgets(value);
        });
        me.autoScroll = me.ui.property.toggleOptionSet(me, "autoScroll", me.updateScrolling);
        me.snapToPage = me.ui.property.toggleOptionSet(me, "snapToPage", me.updateScrolling);
        me.language = me.ui.property.choiceOptionSet(me, "language", me.transform.set);
        me.fontSize = me.ui.property.choiceOptionSet(me, "fontSize", function (options, key, value) {
            me.set(me.singleton.var.layout, "ui.style.fontSize", value);
            me.set(me.singleton, "update");
        });
        me.pages = me.ui.property.toggleOptionSet(me, "pages", me.reflow.set);
        me.columns = me.ui.property.toggleOptionSet(me, "columns", me.reflow.set);
        me.headings = me.ui.property.toggleOptionSet(me, "headings", me.transform.set);
        me.scrollPos = me.ui.property.choiceOptionSet(me, "scrollPos");
        me.ui.theme.useStylesheet("kab.terms");
    };
    me.updateWidgets = function (showInput) {
        me.set(me.singleton.var.input, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(me.singleton.var.transform, "ui.style.display", showInput ? "inline-block" : "none");
        me.set(me.singleton.var.layout, "ui.style.top", showInput ? "250px" : "0px");
        me.set(me.singleton.var.layout, "ui.style.borderTop", showInput ? "1px solid black" : "none");
        me.set(me.singleton.var.layout, "ui.style.fontSize", me.options.fontSize);
        me.set(me.singleton, "update");
    };
    me.shouldReflow = function() {
        var reflow = false;
        var pageSize = me.ui.layout.pageSize(me.singleton.var.layout);
        if(me.get(me.singleton, "visible")) {
            if(pageSize.height !== me.pageSize.height || pageSize.width !== me.pageSize.width) {
                reflow = true;
            }
            if(me.forceReflow) {
                reflow = true;
            }
        }
        return reflow;
    };
    me.updateSpinner = function() {
        if(me.singleton.inTransition > 0) {
            me.set(me.singleton.var.spinner, "ui.style.visibility", "visible");
        }
        else {
            me.set(me.singleton.var.spinner, "ui.style.visibility", "hidden");
        }
    };
    me.updateScrolling = function() {
        var scrollbar = me.singleton.var.layout.var.vertical;
        var pageSize = me.ui.layout.pageSize(me.singleton.var.layout);
        var snapToPage = me.options.snapToPage;
        if(!me.options.pages) {
            snapToPage = false;
        }
        me.set(scrollbar, "snapToPage", snapToPage);
        me.set(scrollbar, "pageSize", pageSize.height);
        me.set(scrollbar, "autoScroll", me.options.autoScroll);
        me.set(scrollbar, "scrollTo", me.options.scrollPos);
        me.set(scrollbar, "snap");
    };
    me.save = {
        set: function(object, value) {
            var input = me.singleton.var.input;
            me.set(input, "storage.cache.store", me.get(input, "ui.basic.text"));
        }
    };
    me.new = {
        set: function (object) {
            me.set(me.singleton.var.input, "ui.basic.text", "");
            me.set(me.singleton.var.input, "storage.cache.store", "");
            me.set(me.singleton.var.output, "ui.basic.html", "");
            me.ui.layout.clear(me.singleton.var.layout);
            me.updateWidgets(true);
        }
    };
    me.transform = {
        set: function (object) {
            me.ui.layout.clear(me.singleton.var.layout);
            var text = me.get(me.singleton.var.input, "ui.basic.text");
            if (text) {
                me.singleton.inTransition++;
                me.updateSpinner();
                me.updateWidgets(me.options.showInput);
                var language = me.options.language.toLowerCase();
                if (language === "auto") {
                    language = me.core.string.language(text);
                    console.log("detected language: " + language);
                }
                var beforeConversion = performance.now();
                me.set(me.singleton.var.footer, "ui.style.display", "block");
                me.set(me.singleton.var.footer, "ui.basic.text", "Transforming...");
                me.kab.terms.setLanguage(function (numTerms) {
                    me.kab.terms.parse(function (text) {
                        if (me.prevLanguage) {
                            me.set(me.singleton.var.layout, "ui.theme.remove", me.prevLanguage);
                        }
                        me.set(me.singleton.var.layout, "ui.theme.add", language);
                        me.prevLanguage = language;
                        if (me.options.showHtml) {
                            me.set(me.singleton.var.output, "ui.basic.text", text);
                        } else {
                            me.set(me.singleton.var.output, "ui.basic.html", text);
                        }
                        me.ui.layout.move(me.singleton.var.output, me.singleton.var.layout);
                        me.forceReflow = true;
                        me.set(me.singleton, "update");
                        me.updateSpinner();
                        var afterConversion = performance.now();
                        me.set(me.singleton.var.footer, "ui.basic.text", "Transformation took " + (afterConversion - beforeConversion).toFixed() + " milliseconds for " + numTerms + " terms in " + language);
                        setTimeout(function() {
                            me.set(me.singleton.var.footer, "ui.basic.text", "");
                        }, 5000);
                        me.singleton.inTransition--;
                        me.updateSpinner();
                    }, text, me.options);
                }, language);
            }
        }
    };
    me.reflow = {
        set: function(object) {
            me.forceReflow = true;
            me.set(me.singleton, "update");
        }
    };
    me.update = {
        set: function (object) {
            if(!me.shouldReflow(object)) {
                return;
            }
            var visibleWidget = null;
            if(!me.forceReflow) {
                visibleWidget = me.ui.layout.firstVisibleWidget(me.singleton.var.layout);
            }
            me.forceReflow = false;
            me.pageSize = me.ui.layout.pageSize(me.singleton.var.layout);
            me.singleton.inTransition++;
            me.updateSpinner();
            var target = me.widget.container.content(me.singleton.var.layout);
            target.style.opacity = 0;
            if(me.options.pages) {
                target.style.margin = "";
            }
            else {
                target.style.margin = "20px 40px";
            }
            var columnCount = me.options.columns ? 2 : 1;
            var reflowOptions = {
                pageClass:"app.transform.page",
                contentClass:"app.transform.page.content",
                headerClass:"app.transform.page.header",
                pageNumberClass:"app.transform.page.number",
                scrollToTopClass:"app.transfer.page.scrolltotop",
                usePages:me.options.pages,
                columnCount:columnCount
            };
            me.ui.layout.reflow(function() {
                me.singleton.inTransition--;
                me.updateSpinner();
                me.updateScrolling();
                if(visibleWidget) {
                    me.ui.layout.scrollToWidget(visibleWidget, me.singleton.var.layout);
                }
                target.style.opacity = 1;
            }, me.singleton.var.output, me.singleton.var.layout, reflowOptions);
        }
    };
    me.scrolled = {
        set: function(object, value) {
            if(me.singleton.inTransition > 0) {
                return;
            }
            if("vertical" in value) {
                me.set(me.singleton, "app.transform.scrollPos", value.vertical);
            }
        }
    };
};
