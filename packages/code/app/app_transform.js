/*
 @author Zakai Hamilton
 @component AppTransform
 */

package.app.transform = function AppTransform(me) {
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            window.language = null;
            me.ui.options.load(me, window, {
                doTranslation: true,
                doExplanation: true,
                prioritizeExplanation: true,
                addStyles: true,
                keepSource: false,
                showHtml: false,
                showInput: false,
                autoScroll: false,
                snapToPage: true,
                headings: true,
                subHeadings: true,
                pages: true,
                columns: true,
                language: "Auto",
                fontSize: "18px",
                scrollPos: 0,
                phaseNumbers: true,
                diagrams: true,
                pipVideo : false,
                autoPlay: true,
                voice: "UK English Male"
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
                me.core.property.set([window.var.layout, window.var.termTable], "ui.style.fontSize", value);
                window.forceReflow = true;
                me.core.property.notify(window, "update");
            });
            me.pages = me.ui.options.toggleSet(me, "pages", me.reflow.set);
            me.columns = me.ui.options.toggleSet(me, "columns", me.reflow.set);
            me.headings = me.ui.options.toggleSet(me, "headings", me.transform.set);
            me.subHeadings = me.ui.options.toggleSet(me, "subHeadings", me.transform.set);
            me.diagrams = me.ui.options.toggleSet(me, "diagrams", me.transform.set);
            me.pipVideo = me.ui.options.toggleSet(me, "pipVideo", me.reflow.set);
            me.autoPlay = me.ui.options.toggleSet(me, "autoPlay");
            me.voice = me.ui.options.choiceSet(me, "voice", me.reflow.set);
            me.scrollPos = me.ui.options.choiceSet(me, "scrollPos");
            me.ui.class.useStylesheet("kab");
        }
    };
    me.updateWidgets = function (object, showInput, update = true) {
        var window = me.widget.window.mainWindow(object);
        me.core.property.set(window.var.input, "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set(window.var.transform, "ui.style.display", showInput ? "inline-block" : "none");
        me.core.property.set([window.var.filter, window.var.layout], "ui.style.top", showInput ? "250px" : "0px");
        me.core.property.set(window.var.layout, {
            "ui.style.borderTop": showInput ? "1px solid black" : "none",
            "ui.style.fontSize": window.options.fontSize,
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
            if (object.workTimeout) {
                clearTimeout(object.workTimeout);
                object.workTimeout = null;
            }
            if (value) {
                me.core.property.set([object.var.layout, object.var.toggleGlossary, object.var.termPopup, object.var.filter], "ui.style.opacity", 0);
                me.core.property.set(object.var.spinner, "ui.style.visibility", "visible");
            } else {
                object.workTimeout = setTimeout(function () {
                    me.core.property.set(object.var.spinner, "ui.style.visibility", "hidden");
                me.core.property.set([object.var.layout, object.var.toggleGlossary, object.var.termPopup, object.var.filter], "ui.style.opacity", "");
                    me.updateScrolling(object);
                }, 250);
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
        me.core.property.set(scrollbar, {
            "snapToPage" : snapToPage,
            "pageSize": pageSize.height,
            "autoScroll": window.options.autoScroll,
            "scrollTo": window.options.scrollPos,
            "snap" : null
        });
    };
    me.clear = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.input, {
                "ui.basic.text": "",
                "storage.local.store": ""});
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
                var phase = term.phase;
                if (typeof phase !== "string") {
                    if (phase.minor) {
                        phase = phase.minor;
                    } else {
                        phase = phase.major;
                    }
                }
                term.heading.split("/").map(function (subHeading) {
                    var column = table[subHeading];
                    if (!column) {
                        column = table[subHeading] = {};
                    }
                    var row = column[phase];
                    if (!row) {
                        row = column[phase] = [];
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
                        var styles = ["kab.term.phase." + phase, "kab.term.phase." + phase + ".border", language];
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
            me.core.message.waitForWorker(() => {
                me.media.voice.stop();
                me.kab.text.parse((text, terms, data) => {
                    if (data) {
                        me.core.property.set(window.var.filter, "ui.attribute.placeholder", data.filterPlaceholder);
                    }
                    if (window.language) {
                        me.core.property.set([
                            window.var.input,
                            window.var.filter,
                            window.var.termTable,
                            window.var.toggleGlossary,
                            window.var.layout
                        ], "ui.class.remove", window.language);
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
                    window.language = language;
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
            });
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
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            var visibleWidget = null;
            if (!window.contentChanged) {
                visibleWidget = me.ui.layout.firstVisibleWidget(window.var.layout);
            }
            window.forceReflow = false;
            window.contentChanged = false;
            window.pageSize = me.ui.layout.pageSize(window.var.layout);
            me.core.property.set(window.var.spinner, "ui.style.borderTop", "16px solid darkblue");
            var fullscreen = me.core.property.get(window, "fullscreen");
            me.core.property.set(object.var.filter, "ui.style.visibility", !text || fullscreen ? "hidden" : "visible");
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
            var modifiers = [window.language];
            if(window.options.pipVideo) {
                modifiers.push("pipVideo");
            }
            if(me.core.property.get(window, "fullscreen")) {
                modifiers.push("fullscreen");
            }
            modifiers = modifiers.map((modifier) => {
                return "." + modifier;
            });
            var reflowOptions = {
                pageClass: ["app.transform.page", modifiers],
                contentClass: ["app.transform.page.content", modifiers],
                containerClass: ["app.transform.page.container", modifiers],
                videoSlotClass: ["app.transform.page.video.slot", modifiers],
                marginRightClass: ["app.transform.page.margin.right", modifiers],
                headerClass: ["app.transform.page.header", modifiers],
                pageNumberClass: ["app.transform.page.number", modifiers],
                pageReloadClass: ["app.transform.page.button", "app.transform.page.reload", modifiers],
                pageFullscreenClass: ["app.transform.page.button", "app.transform.page.fullscreen", modifiers],
                previousPageClass: ["app.transform.page.button", "app.transform.page.previous", modifiers],
                nextPageClass: ["app.transform.page.button", "app.transform.page.next", modifiers],
                scrollToTopClass: ["app.transform.page.scrolltotop", modifiers],
                separatorClass: ["app.transform.separator", modifiers],
                playClass: ["app.transform.play", modifiers],
                stopClass: ["app.transform.stop", modifiers],
                reloadMethod: "app.transform.transform",
                fullscreenMethod: "widget.window.fullscreen",
                previousPageMethod: "widget.scrollbar.vertical.before",
                nextPageMethod: "widget.scrollbar.vertical.after",
                playMethod: "app.transform.play",
                stopMethod: "app.transform.stop",
                usePages: window.options.pages,
                columnCount: columnCount,
                scrollWidget: visibleWidget,
                scrollPos: window.options.scrollPos,
                playEnabled: window.options.voice !== "None",
                filter: me.core.property.get(window.var.filter, "ui.basic.text")
            };
            window.diagrams = [];
            me.media.voice.stop();
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
            me.core.property.set(window.var.filter, "storage.local.store", me.core.property.get(window.var.filter, "ui.basic.text"));
            me.core.property.set(window, "app.transform.reflow");
        }
    };
    me.termsAvailable = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            return window.dataExists;
        }
    };
    me.toggleTerms = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            return me.core.property.get(window.var.termPopup, "minimize");
        },
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            me.core.property.set(window.var.termPopup, {
                "show": !me.core.property.get(window.var.termPopup, "minimize"),
                "ui.property.style": {
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
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            return window.diagrams && window.diagrams.length;
        }
    };
    me.diagramList = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var diagrams = window.diagrams;
            if (!diagrams) {
                diagrams = [];
            }
            var items = diagrams.map(function (item) {
                var result = [
                    item.title,
                    function () {
                        var isFullscreen = me.core.property.get(window, "fullscreen");
                        me.core.app.launch(null, "diagram", [item.path, window.options, isFullscreen]);
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
            var fullPath = me.fullPath(path);
            me.core.json.loadFile(function (json) {
                if (json.title) {
                    window.diagrams.push({title: json.title, path: path});
                }
            }, fullPath, false);
        }
    };
    me.fullPath = function(name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.showDescriptionBox = function(object, next, visible) {
        var descriptionType = null;
        var descriptionBox = null;
        var window = me.widget.window.mainWindow(object);
        var descriptionTypes = ["source", "related"];
        if(window.options.prioritizeExplanation) {
            descriptionTypes.unshift("technical");
            descriptionTypes.unshift("explanation");
        }
        else {
            descriptionTypes.unshift("explanation");
            descriptionTypes.unshift("technical");
        }
        var descriptionIndex = 0;
        if(next && object.descriptionType) {
            descriptionIndex = descriptionTypes.indexOf(object.descriptionType) + 1;
        }
        for(var cycleIndex = 0; cycleIndex < descriptionTypes.length; cycleIndex++) {
            descriptionType = descriptionTypes[(descriptionIndex+cycleIndex)%descriptionTypes.length];
            descriptionBox = me.ui.node.findById(object, descriptionType);
            if(descriptionBox) {
                break;
            }
        }
        object.descriptionType = descriptionType;
        if (object.hoverTimer) {
            clearTimeout(object.hoverTimer);
        }
        object.hoverTimer = setTimeout(function () {
            me.resetDescription(object);
            if (visible) {
                if (descriptionBox && descriptionBox.resetTimer) {
                    clearTimeout(descriptionBox.resetTimer);
                    descriptionBox.resetTimer = null;
                }
                me.core.property.set(descriptionBox, "ui.style.display", "block");
                setTimeout(function () {
                    me.core.property.set(descriptionBox, "ui.class.add", "show");
                }, 250);
            }
        }, next ? 0 : 1000);
    };
    me.hoverDescription = function (object, state) {
        me.showDescriptionBox(object, false, state);
    };
    me.cycleDescription = function (object) {
        me.showDescriptionBox(object, true, true);
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
        set: function (object) {
            me.storage.data.query((err, items) => {
                me.core.console.error(err);
                me.contentList = items;
            }, "app.transform.content", "title");
        }
    };
    me.init = function (task) {
        me.storage.data.query((err, items) => {
            me.core.console.error(err);
            me.contentList = items;
        }, "app.transform.content", "title");
    };
    me.contentMenuList = {
        get: function (object) {
            var isFirst = true;
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            var contentList = me.contentList;
            if (!contentList) {
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
        set: function (object, value) {
            var baseTitle = "Document " + value;
            me.core.property.set(object, "widget.window.key", baseTitle);
            me.core.property.set(object, "widget.window.title", baseTitle);
        }
    };
    me.contentTitle = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var title = me.ui.layout.firstWidget(window.var.layout);
            if (title && title.tagName.toLowerCase() === "h4") {
                return title.innerText;
            }
            return null;
        }
    };
    me.title = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var title = me.core.property.get(window, "app.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if (title) {
                return key + " - " + title;
            }
            return key;
        }
    };
    me.save = {
        get: function (object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            return text;
        },
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
            var text = me.core.property.get(window.var.input, "ui.basic.text");
            var date = new Date();
            var title = me.core.property.get(window, "app.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if (!title) {
                title = key;
            }
            if (!title) {
                title = date.toLocaleDateString();
            }
            var data = {
                content: me.core.string.encode(text),
                date: date.toString(),
                title: title
            };
            me.storage.data.save(err => {
                if (err) {
                    me.core.console.error("Cannot save content: " + err.message);
                } else {
                    me.refreshContentList.set(object);
                }
            }, data, "app.transform.content", title, ["content"]);
        }
    };
    me.play = function(object) {
        var window = me.widget.window.mainWindow(object);
        var currentPage = me.ui.layout.currentPage(window.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        var isPaused = me.ui.layout.isPaused(currentPage);
        if(isPlaying && !isPaused) {
            me.media.voice.pause();
            me.ui.layout.setPlayState(currentPage, true, true);
        }
        else if(isPlaying && isPaused) {
            me.media.voice.resume();
            me.ui.layout.setPlayState(me.currentPlayingPage, true, false);
        }
        else {
            var text = me.ui.layout.pageText(currentPage, true);
            var params = {
                onstart: () => {
                    me.ui.layout.setPlayState(currentPage, true, false);
                },
                onend: () => {
                    me.ui.layout.clearPage(currentPage);
                    me.ui.layout.setPlayState(currentPage, false, false);
                    if(window.options.autoPlay) {
                        setTimeout(() => {
                            if(!currentPage.last) {
                                me.core.property.set(object, "widget.scrollbar.vertical.after");
                                setTimeout(() => {
                                    me.core.property.set(object, "app.transform.play");
                                }, 1000);
                            }
                        }, 1000);
                    }
                },
                onchange: (index, text) => {
                    me.ui.layout.markPage(currentPage, index, text);
                },
                rate: 1,
                language: window.language
            };
            me.media.voice.play(text, window.options.voice, params);
            if(me.currentPlayingPage) {
                me.ui.layout.setPlayState(me.currentPlayingPage, false, false);
                me.currentPlayingPage = null;
            }
            me.currentPlayingPage = currentPage;
        }
    };
    me.stop = function(object) {
        var window = me.widget.window.mainWindow(object);
        var currentPage = me.ui.layout.currentPage(window.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        if(isPlaying) {
            me.media.voice.stop();
            me.ui.layout.clearPage(currentPage);
            me.ui.layout.setPlayState(currentPage, false, false);
            me.currentPlayingPage = null;
        }
    };
    me.voices = function(object) {
        var window = me.widget.window.mainWindow(object);
        var language = window.language;
        var voicelist = me.media.voice.voices(language);
        voicelist = voicelist.map((voice) => {
            return [voice.name, "app.transform.voice", {
                    "state": "select"
                }
            ];
        });
        return voicelist;
    };
};
