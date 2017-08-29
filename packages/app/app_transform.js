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
                doExplanation: false,
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
                fontSize: "22px",
                scrollPos: 0,
                phaseNumbers: true
            });
            window.pageSize = {width: 0, height: 0};
            window.options.autoScroll = false;
            me.doTranslation = me.ui.options.toggleSet(me, "doTranslation", me.transform.set);
            me.doExplanation = me.ui.options.toggleSet(me, "doExplanation", me.transform.set);
            me.addStyles = me.ui.options.toggleSet(me, "addStyles", me.transform.set);
            me.phaseNumbers = me.ui.options.toggleSet(me, "phaseNumbers", me.transform.set);
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
                me.set(window.var.termTable, "ui.style.fontSize", value);
                window.forceReflow = true;
                me.notify(window, "update");
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
        me.set(window.var.filter, "ui.style.top", showInput ? "250px" : "0px");
        me.set(window.var.layout, "ui.style.top", showInput ? "250px" : "0px");
        me.set(window.var.layout, "ui.style.borderTop", showInput ? "1px solid black" : "none");
        me.set(window.var.layout, "ui.style.fontSize", window.options.fontSize);
        me.set(window.var.termTable, "ui.style.fontSize", window.options.fontSize);
        if (update) {
            me.notify(window, "update");
    }
    };
    me.shouldReflow = function (object) {
        var window = me.widget.window.window(object);
        var reflow = false;
        var pageSize = me.ui.layout.pageSize(window.var.layout);
        if (me.get(window, "visible") && !me.get(window, "conceal")) {
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
                object.var.toggleTerms.style.opacity = 0;
                object.var.termPopup.style.opacity = 0;
            } else {
                me.set(object.var.spinner, "ui.style.visibility", "hidden");
                object.var.layout.style.opacity = 1;
                object.var.toggleTerms.style.opacity = 1;
                object.var.termPopup.style.opacity = 1;
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
            me.set(window.var.input, "storage.cache.store", me.get(window.var.input, "ui.basic.text"));
        }
    };
    me.new = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.set(window.var.input, "ui.basic.text", "");
            me.set(window.var.input, "storage.cache.store", "");
            me.set(window.var.output, "ui.basic.html", "");
            me.ui.node.removeChildren(window.var.filterList);
            me.ui.node.removeChildren(window.var.termTable);
            me.ui.layout.clear(window.var.layout);
            me.updateWidgets(window, true);
            window.options.scrollPos = 0;
        }
    };
    me.updateFilterList = function (window, terms) {
        me.ui.node.removeChildren(window.var.filterList);
        var searchItems = Object.keys(terms).map(function (key) {
            return [key, terms[key]];
        });
        searchItems.sort(function (first, second) {
            return second[1].count - first[1].count;
        });
        searchItems.map(function (searchItem) {
            var term = searchItem[0];
            var info = searchItem[1];
            if(!info.used) {
                return;
            }
            var option = document.createElement("option");
            option.textContent = term;
            if (info.source) {
                option.setAttribute("label", info.source);
            }
            window.var.filterList.appendChild(option);
        });
    };
    me.updateTermTable = function (window, terms, data, language) {
        var table = {};
        for (var termName in terms) {
            var term = terms[termName];
            if (term.heading && term.phase) {
                term.heading.split("/").map(function (subHeading) {
                    var column = table[subHeading];
                    if (!column) {
                        column = table[subHeading] = {};
                    }
                    var row = column[term.phase];
                    if (!row) {
                        row = column[term.phase] = [];
                    }
                    term.name = termName;
                    row.push(term);
                });
            }
        }
        for (var heading in table) {
            var row = table[heading];
            var usedRow = false;
            for(var phase in row) {
                var usedColumn = false;
                var column = row[phase];
                for(var name in column) {
                    var item = column[name];
                    if(item.used) {
                        usedRow = true;
                        usedColumn = true;
                    }
                }
                if(usedColumn) {
                    for(var name in column) {
                        var item = column[name];
                        if(!item.used) {
                            delete column[name];
                        }
                    }
                }
            }
            if(!usedRow) {
                delete table[heading];
            }
        }
        for (var heading in table) {
            var row = table[heading];
            var list = [{"ui.basic.text": heading, "ui.element.component": "widget.table.header"}];
            var order = ["root", "one", "two", "three", "four"];
            order.map(function (phase) {
                var properties = {};
                if (row[phase]) {
                    properties["ui.basic.elements"] = row[phase].map(function (item) {
                        var styles = ["kab.terms.phase." + phase,"kab.terms.phase." + phase + ".outline",language];
                        if(!item.used) {
                            styles.push("app.transform.placeholder");
                        }
                        var itemProperties = {
                            "ui.theme.class":"app.transform.termItem",
                            "ui.theme.add":styles
                        };
                        if(window.options.keepSource) {
                            itemProperties["ui.basic.text"] = item.source + " [" + item.name + "]";
                        }
                        else {
                            itemProperties["ui.basic.text"] = item.name;
                            itemProperties["ui.attribute.app-transform-tooltip"] = item.source;
                        }
                        return itemProperties;
                    });
                }
                properties["ui.theme.add"] = "kab.terms.phase." + phase;
                list.push(properties);
            });
            data.push(list);
        }
        me.set(window.var.termTable, "dataByRows", data);
    };
    me.transform = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.ui.layout.clear(window.var.layout);
            var text = me.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (text) {
                me.set(window.var.spinner, "ui.style.borderTop", "16px solid purple");
                me.set(window, "ui.work.state", true);
                var language = window.options.language.toLowerCase();
                if (language === "auto") {
                    language = me.core.string.language(text);
                    console.log("detected language: " + language);
                }
                me.set(window.var.footer, "ui.style.display", "block");
                me.kab.terms.setLanguage(function (numTerms) {
                    me.kab.terms.parse(function (text, terms, data) {
                        if(data) {
                            me.set(window.var.filter, "ui.attribute.placeholder", data.filterPlaceholder);
                        }
                        if (window.prevLanguage) {
                            me.set(window.var.layout, "ui.theme.remove", window.prevLanguage);
                            me.set(window.var.filter, "ui.theme.remove", window.prevLanguage);
                            me.set(window.var.termTable, "ui.theme.remove", window.prevLanguage);
                            me.set(window.var.toggleTerms, "ui.theme.remove", window.prevLanguage);
                        }
                        me.set(window.var.layout, "ui.theme.add", language);
                        me.set(window.var.filter, "ui.theme.add", language);
                        me.set(window.var.termTable, "ui.theme.add", language);
                        me.set(window.var.toggleTerms, "ui.theme.add", language);
                        window.prevLanguage = language;
                        if (window.options.showHtml) {
                            me.set(window.var.output, "ui.basic.text", text);
                        } else {
                            me.set(window.var.output, "ui.basic.html", text);
                        }
                        me.updateFilterList(window, terms);
                        if(data) {
                            me.updateTermTable(window, terms, data.termTable, language);
                        }
                        me.ui.layout.move(window.var.output, window.var.layout);
                        window.forceReflow = true;
                        window.contentChanged = true;
                        me.set(window, "update");
                        me.set(window, "ui.work.state", false);
                    }, language, text, window.options);
                }, language);
            }
        }
    };
    me.reflow = {
        set: function (object) {
            var window = me.widget.window.window(object);
            window.forceReflow = true;
            me.notify(window, "update");
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
            me.set(window.var.spinner, "ui.style.borderTop", "16px solid darkblue");
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
                separatorClass: "app.transform.separator",
                usePages: window.options.pages,
                columnCount: columnCount,
                scrollWidget: visibleWidget,
                scrollPos: window.options.scrollPos,
                filter: me.get(window.var.filter, "ui.basic.text")
            };
            me.ui.layout.reflow(function () {
                me.set(window, "ui.work.state", false);
            }, window.var.output, window.var.layout, reflowOptions);
        }
    };
    me.scrolled = {
        set: function (object, value) {
            var window = me.widget.window.window(object);
            if (me.get(window, "ui.work.state") || me.get(window, "conceal")) {
                return;
            }
            me.ui.layout.scrolled(window.var.layout);
            if (object.scrolledTimer) {
                clearTimeout(object.scrolledTimer);
            }
            object.scrolledTimer = setTimeout(function () {
                if (me.get(window, "ui.work.state") || me.get(window, "conceal")) {
                    return;
                }
                if ("vertical" in value) {
                    me.set(window, "app.transform.scrollPos", value.vertical);
                }
            }, 2000);
        }
    };
    me.inputCacheKey = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var key = me.get(window, "key");
            return "app-transform-input-" + key;
        }
    };
    me.filterCacheKey = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var key = me.get(window, "key");
            return "app-transform-filter-" + key;
        }
    };
    me.windowCacheKey = {
        get: function (object) {
            var window = me.widget.window.window(object);
            var key = me.get(window, "key");
            return "app-transform-window-" + key;
        }
    };
    me.filterChange = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.set(window.var.filter, "storage.cache.store", me.get(window.var.filter, "ui.basic.text"));
            me.set(window, "app.transform.reflow");
        }
    };
    me.toggleTerms = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.set(window.var.termPopup, "ui.theme.toggle", "show");
            me.notify(window.var.termPopup, "update");
        }
    };
};
