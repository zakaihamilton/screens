/*
 @author Zakai Hamilton
 @component WidgetTransform
 */

screens.widget.transform = function WidgetTransform(me) {
    me.properties = __json__;
    me.initOptions = function (object) {
        var widget = me.findWidget(object);
        var window = me.widget.window(widget);
        widget.language = null;
        me.ui.options.load(me, window, {
            doTranslation: true,
            doExplanation: true,
            prioritizeExplanation: true,
            addStyles: true,
            keepSource: false,
            showHtml: false,
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
            pipVideo: false,
            autoPlay: true,
            voice: "Google UK English Male",
            speed: "Normal"
        });
        widget.options = window.options;
        widget.pageSize = { width: 0, height: 0 };
        widget.options.autoScroll = false;
        me.ui.options.toggleSet(me, "doTranslation", me.transform);
        me.ui.options.toggleSet(me, "doExplanation", me.transform);
        me.ui.options.toggleSet(me, "prioritizeExplanation", me.transform);
        me.ui.options.toggleSet(me, "addStyles", me.transform);
        me.ui.options.toggleSet(me, "phaseNumbers", me.transform);
        me.ui.options.toggleSet(me, "keepSource", me.transform);
        me.ui.options.toggleSet(me, "showHtml", me.transform);
        me.ui.options.toggleSet(me, "autoScroll", me.updateScrolling);
        me.ui.options.toggleSet(me, "snapToPage", me.updateScrolling);
        me.ui.options.choiceSet(me, "language", me.transform);
        me.ui.options.choiceSet(me, "fontSize", function (object, value, key, options) {
            me.core.property.set([widget.var.layout, widget.var.termTable], "ui.style.fontSize", value);
            widget.forceReflow = true;
            me.core.property.notify(widget, "update");
        });
        me.ui.options.toggleSet(me, "pages", me.reflow);
        me.ui.options.toggleSet(me, "columns", me.reflow);
        me.ui.options.toggleSet(me, "headings", me.transform);
        me.ui.options.toggleSet(me, "subHeadings", me.transform);
        me.ui.options.toggleSet(me, "diagrams", me.transform);
        me.ui.options.toggleSet(me, "pipVideo", me.reflow);
        me.ui.options.toggleSet(me, "autoPlay");
        me.ui.options.choiceSet(me, "voice", me.changeVoice);
        me.ui.options.choiceSet(me, "speed", me.changeSpeed);
        me.ui.options.choiceSet(me, "scrollPos");
        me.ui.class.useStylesheet("kab");
    };
    me.findWidget = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (!widget) {
            var window = me.widget.window(object);
            widget = window.var.transform;
        }
        return widget;
    };
    me.text = {
        get: function (object) {
            var widget = me.findWidget(object);
            return widget.transformText;
        },
        set: function (object, value) {
            var widget = me.findWidget(object);
            widget.transformText = value;
        }
    };
    me.transform = async function (object) {
        var widget = me.findWidget(object);
        me.ui.layout.clear(widget.var.layout);
        me.core.property.set(widget.var.input, "ui.basic.save");
        var text = me.core.property.get(widget, "text");
        me.updateWidgets(widget, text, false);
        if (!text) {
            me.clear(object);
            return;
        }
        me.core.property.set([widget.var.layout,widget.var.filter], "ui.style.display", "");
        widget.inTransform = true;
        me.core.property.set(widget.var.spinner, "ui.style.borderTop", "16px solid purple");
        me.core.property.set(widget, "ui.work.state", true);
        var language = widget.options.language.toLowerCase();
        if (language === "auto") {
            language = me.core.string.language(text);
            me.log("detected language: " + language);
        }
        widget.options.hoverCallback = "screens.widget.transform.hoverDescription";
        widget.options.diagramCallback = "screens.widget.transform.loadDiagram";
        widget.options.toggleCallback = "screens.widget.transform.cycleDescription";
        widget.options.reload = true;
        me.media.voice.stop();
        var info = await me.kab.text.parse(language, text, widget.options);
        text = info.text;
        var terms = info.terms;
        var data = info.data;
        if (data) {
            me.core.property.set(widget.var.filter, "ui.attribute.placeholder", data.filterPlaceholder);
        }
        if (widget.language) {
            me.core.property.set([
                widget.var.input,
                widget.var.filter,
                widget.var.termTable,
                widget.var.layout
            ], "ui.class.remove", widget.language);
        }
        me.core.property.set([
            widget.var.input,
            widget.var.filter,
            widget.var.termTable,
            widget.var.layout
        ], "ui.class.add", language);
        me.core.property.set(widget.var.termPopup, "title", data.termTableTitle);
        widget.language = language;
        me.core.property.set(widget.var.output, widget.options.showHtml ? "ui.basic.text" : "ui.basic.html", text);
        me.updateFilterList(widget, terms);
        if (data) {
            me.updateTermTable(widget, terms, data.termTable, language);
        }
        me.ui.layout.move(widget.var.output, widget.var.layout);
        widget.forceReflow = true;
        widget.contentChanged = true;
        widget.inTransform = false;
        me.core.property.notify(widget, "update");
        me.core.property.set(widget, "ui.work.state", false);
    };
    me.updateFilterList = function (object, terms) {
        var widget = me.findWidget(object);
        me.ui.node.removeChildren(widget.var.filterList);
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
            widget.var.filterList.appendChild(option);
        });
    };
    me.showDescriptionBox = function (object, next, visible) {
        var descriptionType = null;
        var descriptionBox = null;
        var widget = me.findWidget(object);
        var descriptionTypes = ["source", "related"];
        if (widget.options.prioritizeExplanation) {
            descriptionTypes.unshift("technical");
            descriptionTypes.unshift("explanation");
        }
        else {
            descriptionTypes.unshift("explanation");
            descriptionTypes.unshift("technical");
        }
        var descriptionIndex = 0;
        if (next && widget.descriptionType) {
            descriptionIndex = descriptionTypes.indexOf(widget.descriptionType) + 1;
        }
        for (var cycleIndex = 0; cycleIndex < descriptionTypes.length; cycleIndex++) {
            descriptionType = descriptionTypes[(descriptionIndex + cycleIndex) % descriptionTypes.length];
            descriptionBox = me.ui.node.findById(widget, descriptionType);
            if (descriptionBox) {
                break;
            }
        }
        widget.descriptionType = descriptionType;
        if (widget.hoverTimer) {
            clearTimeout(widget.hoverTimer);
        }
        widget.hoverTimer = setTimeout(function () {
            me.resetDescription(widget);
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
    me.reflow = function (object) {
        var widget = me.findWidget(object);
        widget.forceReflow = true;
        me.core.property.notify(widget, "update");
    };
    me.work = function (object, value) {
        var widget = me.findWidget(object);
        if (widget.workTimeout) {
            clearTimeout(widget.workTimeout);
            widget.workTimeout = null;
        }
        var text = me.core.property.get(widget, "text");
        if (value && text) {
            me.core.property.set([widget.var.layout, widget.var.termPopup, widget.var.filter], "ui.style.opacity", 0);
            me.core.property.set(widget.var.spinner, "ui.style.visibility", "visible");
        } else {
            widget.workTimeout = setTimeout(function () {
                me.core.property.set(widget.var.spinner, "ui.style.visibility", "hidden");
                me.core.property.set([widget.var.layout, widget.var.termPopup, widget.var.filter], "ui.style.opacity", "");
                me.updateScrolling(widget);
            }, 250);
        }
    };
    me.shouldReflow = function (object) {
        var widget = me.findWidget(object);
        var reflow = false;
        var pageSize = me.ui.layout.pageSize(widget.var.layout);
        var window = me.widget.window(object);
        if (me.core.property.get(window, "visible") && !me.core.property.get(window, "conceal")) {
            if (widget.pageSize && (pageSize.height !== widget.pageSize.height || pageSize.width !== widget.pageSize.width)) {
                reflow = true;
            }
            if (widget.forceReflow) {
                reflow = true;
            }
        }
        return reflow;
    };
    me.update = function (object) {
        var widget = me.findWidget(object);
        if (widget.inTransform) {
            return;
        }
        if (!me.shouldReflow(object)) {
            return;
        }
        var text = me.core.property.get(widget.var.input, "ui.basic.text");
        var visibleWidget = null;
        if (!widget.contentChanged) {
            visibleWidget = me.ui.layout.firstVisibleWidget(widget.var.layout);
        }
        widget.forceReflow = false;
        widget.contentChanged = false;
        widget.pageSize = me.ui.layout.pageSize(widget.var.layout);
        me.core.property.set(widget.var.spinner, "ui.style.borderTop", "16px solid darkblue");
        var window = me.widget.window(object);
        var fullscreen = me.core.property.get(window, "fullscreen");
        me.core.property.set(widget.var.filter, "ui.basic.hide", fullscreen);
        me.core.property.set(widget.var.layout, "widget.scrollbar.vertical.alwaysHide", fullscreen);
        me.core.property.set(widget, "ui.work.state", true);
        var target = me.widget.container.content(widget.var.layout);
        widget.var.layout.style.opacity = 0;
        if (widget.options.pages) {
            target.style.margin = "";
        } else {
            target.style.margin = "20px 40px";
        }
        var columnCount = widget.options.columns ? 2 : 1;
        var modifiers = [widget.language];
        if (widget.options.pipVideo) {
            modifiers.push("pipVideo");
        }
        if (me.core.property.get(widget, "fullscreen")) {
            modifiers.push("fullscreen");
        }
        modifiers = modifiers.map((modifier) => {
            return "." + modifier;
        });
        var reflowOptions = {
            widgetProperties: {
                "ui.class.add": ["widget.transform.widget", modifiers],
                "!ui.touch.contextmenu": "widget.transform.notes"
            },
            pageClass: ["widget.transform.page", modifiers],
            contentClass: ["widget.transform.page.content", modifiers],
            widgetClass: ["widget.transform.page.container", modifiers],
            videoSlotClass: ["widget.transform.page.video.slot", modifiers],
            marginRightClass: ["widget.transform.page.margin.right", modifiers],
            headerClass: ["widget.transform.page.header", modifiers],
            pageNumberClass: ["widget.transform.page.number", modifiers],
            pageReloadClass: ["widget.transform.page.button", "widget.transform.page.reload", modifiers],
            pageFullscreenClass: ["widget.transform.page.button", "widget.transform.page.fullscreen", modifiers],
            previousPageClass: ["widget.transform.page.button", "widget.transform.page.previous", modifiers],
            nextPageClass: ["widget.transform.page.button", "widget.transform.page.next", modifiers],
            scrollToTopClass: ["widget.transform.page.scrolltotop", modifiers],
            separatorClass: ["widget.transform.separator", modifiers],
            rewindClass: ["widget.transform.rewind", modifiers],
            playClass: ["widget.transform.play", modifiers],
            fastforwardClass: ["widget.transform.fastforward", modifiers],
            stopClass: ["widget.transform.stop", modifiers],
            reloadMethod: "widget.transform.transform",
            fullscreenMethod: "widget.container.fullscreen",
            previousPageMethod: "widget.scrollbar.vertical.before",
            nextPageMethod: "widget.scrollbar.vertical.after",
            playMethod: "widget.transform.play",
            rewindMethod: "widget.transform.rewind",
            fastforwardMethod: "widget.transform.fastforward",
            stopMethod: "widget.transform.stop",
            usePages: widget.options.pages,
            columnCount: columnCount,
            scrollWidget: visibleWidget,
            scrollPos: widget.options.scrollPos,
            playEnabled: widget.options.voice !== "None",
            filter: me.core.property.get(widget.var.filter, "ui.basic.text")
        };
        widget.diagrams = [];
        me.media.voice.stop();
        me.ui.layout.reflow(function () {
            me.core.property.set(widget, "ui.work.state", false);
            var title = me.core.property.get(widget, "widget.transform.title");
            me.core.property.set(widget, "widget.container.title", title);
        }, widget.var.output, widget.var.layout, reflowOptions);
    };
    me.scrolled = {
        set: function (object, value) {
            var widget = me.findWidget(object);
            if (me.core.property.get(widget, "ui.work.state") || me.core.property.get(widget, "conceal")) {
                return;
            }
            me.ui.layout.updatePages(widget.var.layout);
            if (widget.scrolledTimer) {
                clearTimeout(widget.scrolledTimer);
            }
            widget.scrolledTimer = setTimeout(function () {
                if (me.core.property.get(widget, "ui.work.state") || me.core.property.get(widget, "conceal")) {
                    return;
                }
                if ("vertical" in value) {
                    me.core.property.set(widget, "widget.transform.scrollPos", value.vertical);
                }
            }, 2000);
        }
    };
    me.filterChange = {
        set: function (object) {
            var widget = me.findWidget(object);
            var currentFilter = me.ui.layout.options(widget.var.layout);
            var newFilter = me.core.property.get(widget.var.filter, "ui.basic.text");
            me.core.property.set(widget.var.filter, "storage.local.store", newFilter);
            if (currentFilter && currentFilter.filter !== newFilter) {
                me.core.property.set(widget, "widget.transform.reflow");
            }
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
    me.loadDiagram = {
        set: async function (object, path) {
            var widget = me.findWidget(object);
            var fullPath = me.fullPath(path);
            var json = await me.core.json.loadFile(fullPath, false);
            if (json.title) {
                widget.diagrams.push({ title: json.title, path: path });
            }
        }
    };
    me.changeVoice = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        var isPaused = me.ui.layout.isPaused(currentPage);
        var playWillEnable = widget.options.voice !== "None";
        var playEnabled = me.ui.layout.options(widget.var.layout).playEnabled;
        if (playWillEnable !== playEnabled && (!playEnabled || !playWillEnable)) {
            me.reflow(object);
            return;
        }
        if (isPlaying && !isPaused) {
            me.play(object, me.media.voice.currentIndex, false);
        }
    };
    me.changeSpeed = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        var isPaused = me.ui.layout.isPaused(currentPage);
        if (isPlaying && !isPaused) {
            me.play(object, me.media.voice.currentIndex, false);
        }
    };
    me.play = function (object, value, toggle = true) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        var isPaused = me.ui.layout.isPaused(currentPage);
        if (toggle ? (isPlaying && !isPaused) : (isPlaying && isPaused)) {
            me.media.voice.pause();
            me.ui.layout.setPlayState(currentPage, true, true);
        }
        else if (toggle && isPlaying && isPaused) {
            me.media.voice.resume();
            me.ui.layout.setPlayState(me.currentPlayingPage, true, false);
        }
        else {
            var index = 0;
            if (typeof value === "number") {
                index = value;
            }
            var text = me.ui.layout.pageText(currentPage);
            var params = {
                index: index,
                onstart: () => {
                    me.log("onstart");
                    me.ui.layout.setPlayState(currentPage, true, false);
                },
                oncancel: () => {
                    me.log("oncancel");
                    me.ui.layout.clearPage(currentPage);
                    me.ui.layout.setPlayState(currentPage, false, false);
                },
                onend: () => {
                    me.log("onend");
                    me.ui.layout.clearPage(currentPage);
                    me.ui.layout.setPlayState(currentPage, false, false);
                    if (widget.options.autoPlay) {
                        if (!currentPage.last) {
                            setTimeout(() => {
                                me.core.property.set(object, "widget.scrollbar.vertical.after");
                                setTimeout(() => {
                                    me.core.property.set(object, "widget.transform.play");
                                }, 1000);
                            }, 1000);
                        }
                    }
                },
                onprevious: () => {
                    var pageNumber = me.core.property.get(currentPage, "ui.attribute.pageNumber");
                    if (pageNumber > 1) {
                        me.ui.layout.clearPage(currentPage);
                        me.core.property.set(object, "widget.scrollbar.vertical.before");
                        me.core.property.set(object, "widget.transform.play", -1);
                    }
                    else {
                        me.media.voice.replay();
                    }
                },
                onnext: () => {
                    me.ui.layout.clearPage(currentPage);
                    if (currentPage.last) {
                        me.ui.layout.setPlayState(currentPage, false, false);
                        me.currentPlayingPage = null;
                    }
                    else {
                        me.core.property.set(object, "widget.scrollbar.vertical.after");
                        me.core.property.set(object, "widget.transform.play");
                    }
                },
                onchange: (index, text) => {
                    me.log("onchange: " + index + " text:" + text);
                    me.ui.layout.markPage(currentPage, index, text);
                },
                rate: widget.options.speed,
                language: widget.language
            };
            me.media.voice.play(text, widget.options.voice, params);
            if (me.currentPlayingPage && me.currentPlayingPage !== currentPage) {
                me.ui.layout.setPlayState(me.currentPlayingPage, false, false);
                me.currentPlayingPage = null;
            }
            me.currentPlayingPage = currentPage;
        }
    };
    me.stop = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.stop();
            me.ui.layout.clearPage(currentPage);
            me.ui.layout.setPlayState(currentPage, false, false);
            me.currentPlayingPage = null;
        }
    };
    me.rewind = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.rewind();
        }
    };
    me.fastforward = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.ui.layout.currentPage(widget.var.layout);
        var isPlaying = me.ui.layout.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.fastforward();
        }
    };
    me.voices = function (object) {
        var widget = me.findWidget(object);
        var language = widget.language;
        var voicelist = me.media.voice.voices(language);
        voicelist = voicelist.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        voicelist = voicelist.map((voice) => {
            var name = voice.name;
            return [voice.name, "widget.transform.voice", {
                "state": "select",
                "mark": !voice.localService
            },
            {
                "group": "voices"
            }
            ];
        });
        return voicelist;
    };
    me.speeds = function (object) {
        var speedList = Object.keys(me.media.voice.speeds);
        speedList.map(name => {
            var item = [
                name,
                "widget.transform.speed",
                {
                    "state": "select"
                },
                {
                    "group": "speed"
                }
            ];
            speedList.push(item);
        });
        return speedList;
    };
    me.fontSizes = function (object) {
        var fontSizeList = [];
        for (var fontSize = 12; fontSize <= 32; fontSize += 2) {
            var item = [
                fontSize + "px",
                "widget.transform.fontSize",
                {
                    "state": "select"
                },
                {
                    "group": "fontSize"
                }
            ];
            fontSizeList.push(item);
        }
        return fontSizeList;
    };
    me.fullPath = function (name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.notes = function (object, event) {
        event.preventDefault();
        return false;
    };
    me.updateWidgets = function (object, hasText, update = true) {
        var widget = me.findWidget(object);
        me.core.property.set(widget.var.layout, {
            "ui.style.fontSize": widget.options.fontSize,
            "ui.scroll.swipe": widget.options.swipe ? "vertical" : ""
        });
        me.core.property.set(widget.var.termTable, "ui.style.fontSize", widget.options.fontSize);
        if (update) {
            me.core.property.notify(widget, "update");
        }
    };
    me.toggleTerms = {
        get: function (object) {
            var widget = me.findWidget(object);
            return me.core.property.get(widget.var.termPopup, "minimize");
        },
        set: function (object) {
            var widget = me.findWidget(object);
            me.core.property.set(widget.var.termPopup, {
                "show": !me.core.property.get(widget.var.termPopup, "minimize"),
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
    me.updateTermTable = function (widget, terms, data, language) {
        widget.dataExists = false;
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
            var list = [{ "ui.basic.text": heading, "ui.element.component": "widget.table.header" }];
            var order = ["root", "one", "two", "three", "four"];
            order.map(function (phase) {
                var properties = {};
                if (row[phase]) {
                    properties["ui.basic.elements"] = row[phase].map(function (item) {
                        var styles = ["kab.term.phase." + phase, "kab.term.phase." + phase + ".border", language];
                        if (!item.used) {
                            styles.push("widget.transform.placeholder");
                        }
                        var itemProperties = {
                            "ui.class.class": "widget.transform.termItem",
                            "ui.class.add": styles
                        };
                        if (widget.options.keepSource) {
                            itemProperties["ui.basic.text"] = item.source + " [" + item.name + "]";
                        } else {
                            itemProperties["ui.basic.text"] = item.name;
                            itemProperties["ui.attribute.app-transform-tooltip"] = item.source;
                        }
                        return itemProperties;
                    });
                    widget.dataExists = true;
                }
                properties["ui.class.add"] = "kab.term.phase." + phase;
                list.push(properties);
            });
            data.push(list);
        }
        me.core.property.set(widget.var.termTable, "dataByRows", data);
    };
    me.updateScrolling = function (object) {
        var widget = me.findWidget(object);
        var scrollbar = widget.var.layout.var.vertical;
        var pageSize = me.ui.layout.pageSize(widget.var.layout);
        var snapToPage = widget.options.snapToPage;
        if (!widget.options.pages) {
            snapToPage = false;
        }
        me.core.property.set(scrollbar, {
            "snapToPage": snapToPage,
            "pageSize": pageSize.height,
            "autoScroll": widget.options.autoScroll,
            "scrollTo": widget.options.scrollPos,
            "snap": null
        });
    };
    me.clear = function (object) {
        var widget = me.findWidget(object);
        me.core.property.set(widget.var.output, "ui.basic.html", "");
        me.ui.node.removeChildren(widget.var.filterList);
        me.ui.node.removeChildren(widget.var.termTable);
        me.ui.layout.clear(widget.var.layout);
        me.updateWidgets(widget, true);
        widget.options.scrollPos = 0;
        me.core.property.set([widget.var.layout,widget.var.filter], "ui.style.display", "none");
    };
};
