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
                scrollPos: 0,
                phaseNumbers:true
            });
            window.pageSize = {width: 0, height: 0};
            window.options.autoScroll = false;
            me.translation = me.ui.options.toggleSet(me, "doTranslation", me.transform.set);
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
        me.set(window.var.filter, "ui.style.top", showInput ? "250px" : "0px");
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
            me.ui.node.removeChildren(window.var.TermTable);
            me.ui.layout.clear(window.var.layout);
            me.updateWidgets(window, true);
            window.options.scrollPos = 0;
        }
    };
    me.updateFilterList = function(window, terms) {
        me.ui.node.removeChildren(window.var.filterList);
        var searchItems = Object.keys(terms).map(function (key) {
            return [key, terms[key]];
        });
        searchItems.sort(function (first, second) {
            return second[1].count - first[1].count;
        });
        searchItems.map(function(searchItem) {
            var term = searchItem[0];
            var info = searchItem[1];
            var option = document.createElement("option");
            option.textContent = term;
            if(info.label) {
                option.setAttribute("label", info.label);
            }
            window.var.filterList.appendChild(option);
        });
    };
    me.updateTermTable = function(window, terms) {
        return;
        me.ui.node.removeChildren(window.var.TermTable);
        var table = {};
        for(var termName in terms) {
            var term = terms[termName];
            if(term.heading && term.phase) {
                var column = table[term.heading];
                if(!column) {
                    column = table[term.heading] = {};
                }
                var row = column[term.phase];
                if(!row) {
                    row = table[term.phase] = [];
                }
                term.name = termName;
                row.push(term);
            }
        }
        for(var heading in table) {
            var column = table[heading];
            var container = document.createElement('div');
            container.className = "app-transform-term-column";
            var list = document.createElement('ul');
            list.className = "app-transform-term-list";
            container.appendChild(list);
            var item = document.createElement('li');
            item.className = "app-transform-term-header";
            item.textContent = heading;
            list.appendChild(item);
            for(var phase in column) {
                var row = column[phase];
                var phaseList = document.createElement('ul');
                row.map(function(item) {
                    var entry = document.createElement('li');
                    entry.textContent = item.name;
                    phaseList.appendChild(entry);
                });
                list.appendChild(phaseList);
            }
            window.var.termTable.appendChild(container);
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
                var language = window.options.language.toLowerCase();
                if (language === "auto") {
                    language = me.core.string.language(text);
                    console.log("detected language: " + language);
                }
                var beforeConversion = performance.now();
                me.set(window.var.footer, "ui.style.display", "block");
                me.set(window.var.footer, "ui.basic.text", "Transforming...");
                me.kab.terms.setLanguage(function (numTerms) {
                    me.kab.terms.parse(function (text, usedTerms) {
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
                        me.updateFilterList(window, usedTerms);
                        me.updateTermTable(window, usedTerms);
                        me.ui.layout.move(window.var.output, window.var.layout);
                        window.forceReflow = true;
                        window.contentChanged = true;
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
            if(object.scrolledTimer) {
                clearTimeout(object.scrolledTimer);
            }
            object.scrolledTimer = setTimeout(function() {
                var window = me.widget.window.window(object);
                if (me.get(window, "ui.work.state")) {
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
            me.set(window.var.termTable, "ui.theme.toggle", "show");
        }
    };
};
