/*
 @author Zakai Hamilton
 @component AppTransform
 */

package.app.transform = function AppTransform(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.core.app.preload(() => {
            me.singleton = me.ui.element.create(__json__, "workspace", "self");
        }, "diagram");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            window.prevLanguage = null;
            me.ui.options.load(me, window, {
                doTranslation: true,
                doExplanation: false,
                prioritizeExplanation: false,
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
                phaseNumbers: true,
                diagrams: true,
                embedded: true,
                swipe: me.core.device.isMobile()
            });
            window.pageSize = {width: 0, height: 0};
            window.options.autoScroll = false;
            me.doTranslation = me.ui.options.toggleSet(me, "doTranslation", me.transform.set);
            me.doExplanation = me.ui.options.toggleSet(me, "doExplanation", me.transform.set);
            me.prioritizeExplanation = me.ui.options.toggleSet(me, "prioritizeExplanation", me.transform.set);
            me.addStyles = me.ui.options.toggleSet(me, "addStyles", me.transform.set);
            me.phaseNumbers = me.ui.options.toggleSet(me, "phaseNumbers", me.transform.set);
            me.keepSource = me.ui.options.toggleSet(me, "keepSource", me.transform.set);
            me.showHtml = me.ui.options.toggleSet(me, "showHtml", me.transform.set);
            me.showInput = me.ui.options.toggleSet(me, "showInput", function (object, options, key, value) {
                var window = me.widget.window.mainWindow(object);
                var text = me.core.property.get(window.var.layout, "ui.basic.text");
                if (!text) {
                    value = true;
                }
                me.updateWidgets(window, value);
            });
            me.autoScroll = me.ui.options.toggleSet(me, "autoScroll", me.updateScrolling);
            me.snapToPage = me.ui.options.toggleSet(me, "snapToPage", me.updateScrolling);
            me.language = me.ui.options.choiceSet(me, "language", me.transform.set);
            me.fontSize = me.ui.options.choiceSet(me, "fontSize", function (object, options, key, value) {
                var window = me.widget.window.mainWindow(object);
                me.core.property.set([window.var.layout,window.var.termTable], "ui.style.fontSize", value);
                window.forceReflow = true;
                me.core.property.notify(window, "update");
            });
            me.pages = me.ui.options.toggleSet(me, "pages", me.reflow.set);
            me.columns = me.ui.options.toggleSet(me, "columns", me.reflow.set);
            me.headings = me.ui.options.toggleSet(me, "headings", me.transform.set);
            me.diagrams = me.ui.options.toggleSet(me, "diagrams", me.transform.set);
            me.embedded = me.ui.options.toggleSet(me, "embedded", me.reflow.set);
            me.scrollPos = me.ui.options.choiceSet(me, "scrollPos");
            me.swipe = me.ui.options.toggleSet(me, "swipe", function(object, options, key, value) {
                var window = me.widget.window.mainWindow(object);
                me.core.property.set(window.var.layout, "ui.scroll.swipe", value ? "vertical" : "");
            });
            me.ui.class.useStylesheet("kab.term");
        }
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = me.widget.window.mainWindow(object);
        me.core.property.set(window.var.input, "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set(window.var.transform, "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set([window.var.filter,window.var.layout], "ui.style.top", showInput ? "250px" : "0px");
        me.core.property.set(window.var.layout, {
            "ui.style.borderTop" : showInput ? "1px solid black" : "none",
            "ui.style.fontSize" : window.options.fontSize,
            "ui.scroll.swipe": window.options.swipe ? "vertical" : ""
        });
        me.core.property.set(window.var.termTable, "ui.style.fontSize", window.options.fontSize);
        if (update) {
            me.core.property.notify(window, "update");
    }
    };
    me.shouldReflow = function (object) {
        var window = me.widget.window.mainWindow(object);
        var reflow = false;
        var pageSize = me.ui.layout.pageSize(window.var.layout);
        if (me.core.property.get(window, "visible") && !me.core.property.get(window, "conceal")) {
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
            if(object.workTimeout) {
                clearTimeout(object.workTimeout);
                object.workTimeout = null;
            }
            if (value) {
                me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
                object.var.layout.style.opacity = 0;
                object.var.toggleGlossary.style.opacity = 0;
                object.var.termPopup.style.opacity = 0;
                object.var.filter.style.opacity = 0;
            } else {
                object.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                    object.var.layout.style.opacity = 1;
                    object.var.toggleGlossary.style.opacity = 1;
                    object.var.termPopup.style.opacity = "";
                    object.var.filter.style.opacity = "";
                    me.updateScrolling(object);
                }, 500);
            }
        }
    };
    me.updateScrolling = function (object) {
        var window = me.widget.window.mainWindow(object);
        var scrollbar = window.var.layout.var.vertical;
        var pageSize = me.ui.layout.pageSize(window.var.layout);
        var snapToPage = window.options.snapToPage;
        if (!window.options.pages) {
            snapToPage = false;
        }
        me.core.property.set(scrollbar, "snapToPage", snapToPage);
        me.core.property.set(scrollbar, "pageSize", pageSize.height);
        me.core.property.set(scrollbar, "autoScroll", window.options.autoScroll);
        me.core.property.set(scrollbar, "scrollTo", window.options.scrollPos);
        me.core.property.set(scrollbar, "snap");
    };
    me.new = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.input, "ui.basic.text", "");
            me.core.property.set(window.var.input, "storage.cache.store", "");
            me.core.property.set(window.var.output, "ui.basic.html", "");
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
            if (!info.used) {
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
        window.dataExists = false;
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
            for (var phase in row) {
                var usedColumn = false;
                var column = row[phase];
                for (var name in column) {
                    var item = column[name];
                    if (item.used) {
                        usedRow = true;
                        usedColumn = true;
                    }
                }
                if (usedColumn) {
                    for (var name in column) {
                        var item = column[name];
                        if (!item.used) {
                            delete column[name];
                        }
                    }
                }
            }
            if (!usedRow) {
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
                        var styles = ["kab.term.phase." + phase, "kab.term.phase." + phase + ".outline", language];
                        if (!item.used) {
                            styles.push("app.transform.placeholder");
                        }
                        var itemProperties = {
                            "ui.class.class": "app.transform.termItem",
                            "ui.class.add": styles
                        };
                        if (window.options.keepSource) {
                            itemProperties["ui.basic.text"] = item.source + " [" + item.name + "]";
                        } else {
                            itemProperties["ui.basic.text"] = item.name;
                            itemProperties["ui.attribute.app-transform-tooltip"] = item.source;
                        }
                        return itemProperties;
                    });
                    window.dataExists = true;
                }
                properties["ui.class.add"] = "kab.term.phase." + phase;
                list.push(properties);
            });
            data.push(list);
        }
        me.core.property.set(window.var.termTable, "dataByRows", data);
    };
    me.transform = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.ui.layout.clear(window.var.layout);
            me.core.property.set(window.var.input, "ui.basic.save");
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            me.updateWidgets(window, window.options.showInput || !text, false);
            if (!text) {
                return;
            }
            window.inTransform = true;
            me.core.property.set(window.var.spinner, "ui.style.borderTop", "16px solid purple");
            me.core.property.set(window, "ui.work.state", true);
            var language = window.options.language.toLowerCase();
            if (language === "auto") {
                language = me.core.string.language(text);
                me.core.console.log("detected language: " + language);
            }
            window.options.hoverCallback = "package.app.transform.hoverDescription";
            window.options.diagramCallback = "package.app.transform.loadDiagram";
            window.options.toggleCallback = "package.app.transform.cycleDescription";
            window.options.reload = true;
            me.kab.text.parse(function (text, terms, data) {
                if (data) {
                    me.core.property.set(window.var.filter, "ui.attribute.placeholder", data.filterPlaceholder);
                }
                if (window.prevLanguage) {
                    me.core.property.set([
                        window.var.input,
                        window.var.filter,
                        window.var.termTable,
                        window.var.toggleGlossary,
                        window.var.layout
                    ], "ui.class.remove", window.prevLanguage);
                }
                me.core.property.set([
                    window.var.input,
                    window.var.filter,
                    window.var.termTable,
                    window.var.toggleGlossary,
                    window.var.layout
                ], "ui.class.add", language);
                me.core.property.set(window.var.toggleGlossary, "ui.basic.text", data.glossaryTitle);
                me.core.property.set(window.var.termPopup, "title", data.termTableTitle);
                window.prevLanguage = language;
                me.core.property.set(window.var.output, window.options.showHtml ? "ui.basic.text" : "ui.basic.html", text);
                me.updateFilterList(window, terms);
                if (data) {
                    me.updateTermTable(window, terms, data.termTable, language);
                }
                me.ui.layout.move(window.var.output, window.var.layout);
                window.forceReflow = true;
                window.contentChanged = true;
                window.inTransform = false;
                me.core.property.notify(window, "update");
                me.core.property.set(window, "ui.work.state", false);
            }, language, text, window.options);
        }
    };
    me.reflow = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            if (window) {
                window.forceReflow = true;
                me.core.property.notify(window, "update");
            }
        }
    };
    me.update = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            if (window.inTransform) {
                return;
            }
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
            me.core.property.set(window.var.spinner, "ui.style.borderTop", "16px solid darkblue");
            var fullscreen = me.core.property.get(window, "fullscreen");
            me.core.property.set(object.var.filter, "ui.style.visibility", fullscreen ? "hidden" : "visible");
            me.core.property.set(object.var.layout, "widget.scrollbar.vertical.alwaysHide", fullscreen);
            me.core.property.set(window, "ui.work.state", true);
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
                containerClass: "app.transform.page.container",
                marginLeftClass: "app.transform.page.margin.left",
                marginRightClass: "app.transform.page.margin.right",
                headerClass: "app.transform.page.header",
                pageNumberClass: "app.transform.page.number",
                scrollToTopClass: "app.transfer.page.scrolltotop",
                separatorClass: "app.transform.separator",
                usePages: window.options.pages,
                columnCount: columnCount,
                scrollWidget: visibleWidget,
                scrollPos: window.options.scrollPos,
                filter: me.core.property.get(window.var.filter, "ui.basic.text")
            };
            window.diagrams = [];
            me.ui.layout.reflow(function () {
                me.core.property.set(window, "ui.work.state", false);
                var title = me.core.property.get(window, "app.transform.title");
                me.core.property.set(window, "widget.window.title", title);
            }, window.var.output, window.var.layout, reflowOptions);
        }
    };
    me.scrolled = {
        set: function (object, value) {
            var window = me.widget.window.mainWindow(object);
            if (me.core.property.get(window, "ui.work.state") || me.core.property.get(window, "conceal")) {
                return;
            }
            me.ui.layout.updatePages(window.var.layout);
            if (object.scrolledTimer) {
                clearTimeout(object.scrolledTimer);
            }
            object.scrolledTimer = setTimeout(function () {
                if (me.core.property.get(window, "ui.work.state") || me.core.property.get(window, "conceal")) {
                    return;
                }
                if ("vertical" in value) {
                    me.core.property.set(window, "app.transform.scrollPos", value.vertical);
                }
            }, 2000);
        }
    };
    me.filterChange = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.filter, "storage.cache.store", me.core.property.get(window.var.filter, "ui.basic.text"));
            me.core.property.set(window, "app.transform.reflow");
        }
    };
    me.termsAvailable = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            return window.dataExists;
        }
    };
    me.toggleTerms = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            return me.core.property.get(window.var.termPopup, "minimize");
        },
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.termPopup, {
                "show": !me.core.property.get(window.var.termPopup, "minimize"),
                "ui.property.style":{
                    "left": "25px",
                    "top": "50px",
                    "right": "25px",
                    "bottom": "100px",
                    "width": "",
                    "height": ""
                }
            });
        }
    };
    me.toggleGlossary = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
        }
    };
    me.resetDescription = function (object) {
        var descriptionTypes = ["explanation", "technical", "source", "related"];
        descriptionTypes.map(function (descriptionType) {
            var descriptionBox = me.ui.node.findById(object, descriptionType);
            me.core.property.set(descriptionBox, "ui.class.remove", "show");
            if (descriptionBox) {
                descriptionBox.resetTimer = setTimeout(function () {
                    me.core.property.set(descriptionBox, "ui.style.display", "none");
                }, 1000);
            }
        });
    };
    me.hasDiagrams = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            return window.diagrams && window.diagrams.length;
        }
    };
    me.diagramList = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            var diagrams = window.diagrams;
            if(!diagrams) {
                diagrams = [];
            }
            var items = diagrams.map(function (item) {
                var result = [
                    item.title,
                    function () {
                        me.core.app.launch(null, "diagram", [item.path, window.options]);
                    }
                ];
                return result;
            });
            return items;
        }
    };
    me.loadDiagram = {
        set: function (object, path) {
            var window = me.widget.window.mainWindow(object);
            var fullPath = me.app.diagram.fullPath(path);
            me.core.json.loadFile(function (json) {
                if(json.title) {
                    window.diagrams.push({title:json.title,path:path});
                }
            }, fullPath, false);
            if(window.options.embedded) {
                me.core.app.launch(function (diagramWindow) {
                    me.core.property.set(diagramWindow, "core.link.widget-window-restore", "app.transform.reflow");
                }, "diagram", [path, window.options, object, true]);
            }
        }
    };
    me.hoverDescription = function (object, state) {
        var window = me.widget.window.mainWindow(object);
        var descriptionType = window.options.prioritizeExplanation ? "explanation" : "technical";
        var descriptionBox = me.ui.node.findById(object, descriptionType);
        if (!descriptionBox) {
            descriptionBox = me.ui.node.findById(object, "source");
        }
        if (!descriptionBox) {
            descriptionBox = me.ui.node.findById(object, "related");
        }
        object.descriptionType = null;
        if (object.hoverTimer) {
            clearTimeout(object.hoverTimer);
        }
        object.hoverTimer = setTimeout(function () {
            object.descriptionType = descriptionType;
            me.resetDescription(object);
            if (state) {
                if (descriptionBox && descriptionBox.resetTimer) {
                    clearTimeout(descriptionBox.resetTimer);
                    descriptionBox.resetTimer = null;
                }
                me.core.property.set(descriptionBox, "ui.style.display", "block");
                setTimeout(function () {
                    me.core.property.set(descriptionBox, "ui.class.add", "show");
                }, 500);
            }
        }, 1000);
    };
    me.cycleDescription = function (object) {
        if (!object.descriptionType) {
            return;
        }
        var descriptionTypes = ["explanation", "technical", "source", "related"];
        var descriptionIndex = descriptionTypes.indexOf(object.descriptionType);
        descriptionIndex++;
        if (descriptionIndex >= descriptionTypes.length) {
            descriptionIndex = 0;
        }
        var descriptionType = descriptionTypes[descriptionIndex];
        var descriptionBox = me.ui.node.findById(object, descriptionType);
        if (!descriptionBox) {
            descriptionBox = me.ui.node.findById(object, "source");
        }
        if (!descriptionBox) {
            descriptionBox = me.ui.node.findById(object, "related");
        }
        object.descriptionType = descriptionType;
        me.resetDescription(object);
        if (descriptionBox && descriptionBox.resetTimer) {
            clearTimeout(descriptionBox.resetTimer);
            descriptionBox.resetTimer = null;
        }
        me.core.property.set(descriptionBox, "ui.style.display", "block");
        setTimeout(function () {
            me.core.property.set(descriptionBox, "ui.class.add", "show");
        }, 500);
    };
    me.toggleSeparator = {
        get: function (object, value) {
            var window = me.widget.window.mainWindow(object);
            return me.ui.layout.hasSeparator(me.ui.layout.currentPage(window.var.layout));
        },
        set: function (object, value) {
            var window = me.widget.window.mainWindow(object);
            me.ui.layout.toggleSeparator(me.ui.layout.currentPage(window.var.layout));
        }
    };
    me.refreshContentList = {
        set: function(object) {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.contentList = items;
            }, "app.transform.content", "date");
        }
    };
    me.init = function(task) {
        me.storage.data.query((err, items) => {
            me.core.console.error(err);
            me.contentList = items;
        }, "app.transform.content", "date");
    };
    me.contentMenuList = {
        get: function(object) {
            var isFirst = true;
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            var contentList = me.contentList;
            if(!contentList) {
                contentList = [];
            }
            var items = contentList.map(function (item) {
                var content = me.core.string.decode(item.content);
                var result = [
                    item.title,
                    function () {
                        me.core.property.set(window.var.input, "ui.basic.text", content);
                        me.core.property.set(window, "app.transform.transform");
                    },
                    {
                        "state": function () {
                            return text === content;
                        },
                        "separator": isFirst
                    }
                ];
                isFirst = false;
                return result;
            });
            return items;
        }
    };
    me.documentIndex = {
        set: function(object, value) {
            var baseTitle = "Document " + value;
            me.core.property.set(object, "widget.window.key", baseTitle);
            me.core.property.set(object, "widget.window.title", baseTitle);
        }
    };
    me.contentTitle = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            var title = me.ui.layout.firstWidget(window.var.layout);
            if(title && title.tagName.toLowerCase() === "h4") {
                return title.innerText;
            }
            return null;
        }
    };
    me.title = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            var title = me.core.property.get(window, "app.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if(title) {
                return key + " - " + title;
            }
            return key;
        }
    };
    me.save = {
        get: function(object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            return text;
        },
        set: function(object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            var date = new Date();
            var title = me.core.property.get(window, "app.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if(!title) {
                title = key;
            }
            if(!title) {
                title = date.toLocaleDateString();
            }
            var data = {
                content:me.core.string.encode(text),
                date: date.toString(),
                title: title
            };
            me.storage.data.save(err => {
                if(err) {
                    me.core.console.error("Cannot save content: " + err.message);
                }
                else {
                    me.refreshContentList.set(object);
                }
            }, data, "app.transform.content", title, ["content"]);
        }
    };
};
