/*
 @author Zakai Hamilton
 @component WidgetTransform
 */

screens.widget.transform = function WidgetTransform(me) {
    me.element = {
        properties: __json__
    };
    me.initOptions = function (object) {
        var widget = me.findWidget(object);
        var window = me.widget.window(widget);
        widget.language = null;
        me.ui.options.load(me, widget, {
            doTranslation: true,
            doExplanation: true,
            prioritizeExplanation: true,
            addStyles: true,
            abridged: false,
            keepSource: false,
            headings: true,
            subHeadings: true,
            pages: true,
            columns: true,
            language: "Auto",
            fontSize: "18px",
            scrollPos: 0,
            phaseNumbers: true,
            pipVideo: false,
            playingPopup: false,
            autoPlay: true,
            voice: "Google UK English Male",
            speed: "Normal",
            output: false
        });
        widget.pageSize = { width: 0, height: 0 };
        me.ui.options.toggleSet(me, me.findWidget, {
            doTranslation: me.transform,
            doExplanation: me.transform,
            prioritizeExplanation: me.transform,
            addStyles: me.transform,
            phaseNumbers: me.transform,
            keepSource: me.transform,
            abridged: me.transform,
            pages: me.reflow,
            columns: me.reflow,
            headings: me.transform,
            subHeadings: me.transform,
            diagrams: me.transform,
            pipVideo: me.reflow,
            autoPlay: null,
            playingPopup: me.reflow,
            output: me.transform
        });
        me.ui.options.choiceSet(me, me.findWidget, {
            language: me.transform,
            fontSize: (object, value) => {
                var widget = me.findWidget(object);
                me.core.property.set([widget.var.layout], "ui.style.fontSize", value);
                widget.forceReflow = true;
                me.core.property.notify(widget, "update");
            },
            voice: me.player.changeVoice,
            speed: me.player.changeSpeed,
            scrollPos: null
        });
        me.ui.class.useStylesheet("kab");
    };
    me.findWidget = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (!widget) {
            var window = me.widget.window(object);
            if (window) {
                widget = window.var.transform;
            }
        }
        return widget;
    };
    me.useTitle = {
        get: function (object) {
            var widget = me.findWidget(object);
            return widget.useTitle;
        },
        set: function (object, value) {
            var widget = me.findWidget(object);
            widget.useTitle = value;
        }
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
        me.widget.transform.layout.clear(widget.var.layout);
        var text = widget.transformText;
        widget.contentTitle = "";
        me.updateWidgets(widget, text, false);
        widget.inTransform = true;
        me.core.property.set(widget.var.spinner, "text", "Transform");
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
        var options = Object.assign({}, widget.options, { nightMode: me.ui.theme.options.nightMode });
        var info = await me.kab.text.parse(language, text, options, (percent) => {
            me.core.property.set(widget.var.spinner, "percent", percent);
        });
        if (!info) {
            info = { text: "", terms: {}, data: null };
        }
        text = info.text;
        var terms = info.terms;
        var data = info.data;
        if (widget.language) {
            me.core.property.set(widget.var.layout, "ui.class.remove", widget.language);
        }
        me.core.property.set(widget.var.layout, "ui.class.add", language);
        widget.language = language;
        me.core.property.set(widget.var.output, "ui.basic.html", text);
        if (text) {
            widget.tableOfPhases = { terms, data };
        }
        else {
            widget.tableOfPhases = null;
        }
        if (widget.options.output) {
            me.core.property.set(widget.var.output, "ui.style.display", text ? "" : "none");
            me.core.property.set(widget.var.layout, "ui.style.display", "none");
        }
        else {
            me.core.property.set(widget.var.output, "ui.style.display", "none");
            me.core.property.set(widget.var.layout, "ui.style.display", text ? "" : "none");
            me.widget.transform.layout.move(widget.var.output, widget.var.layout);
        }
        widget.forceReflow = true;
        widget.contentChanged = true;
        widget.inTransform = false;
        me.core.property.set(widget, "update");
        me.core.property.set(widget, "ui.work.state", false);
    };
    me.showDescriptionBox = function (object, next, visible) {
        var descriptionType = null;
        var descriptionBox = null;
        var descriptionTypes = ["source", "related"];
        var widget = me.findWidget(object);
        if (!widget) {
            return;
        }
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
            descriptionBox = me.ui.node.findById(object, descriptionType);
            if (descriptionBox) {
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
            me.core.property.set(widget.var.layout, "ui.style.opacity", 0);
            me.core.property.set(widget.var.spinner, "ui.style.visibility", "visible");
        } else {
            widget.workTimeout = setTimeout(function () {
                me.core.property.set(widget.var.spinner, "ui.style.visibility", "hidden");
                me.core.property.set(widget.var.layout, "ui.style.opacity", "");
                me.updateScrolling(widget);
            }, 250);
        }
    };
    me.shouldReflow = function (object) {
        var widget = me.findWidget(object);
        var reflow = false;
        var pageSize = me.widget.transform.layout.pageSize(widget.var.layout);
        var window = me.widget.window(object);
        var fullscreen = me.core.property.get(window, "fullscreen");
        if (me.core.property.get(window, "visible") && !me.core.property.get(window, "conceal")) {
            if (widget.pageSize && (pageSize.height !== widget.pageSize.height || pageSize.width !== widget.pageSize.width)) {
                reflow = true;
            }
            if (widget.fullscreen !== fullscreen) {
                reflow = true;
            }
            if (widget.forceReflow) {
                reflow = true;
            }
        }
        return reflow;
    };
    me.modifiers = function (object) {
        var widget = me.findWidget(object);
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
        return modifiers;
    };
    me.update = function (object) {
        var widget = me.findWidget(object);
        if (widget.inTransform) {
            return;
        }
        if (!me.shouldReflow(object)) {
            return;
        }
        if (!widget.options) {
            return;
        }
        if (widget.options.output) {
            return;
        }
        var visibleWidget = null;
        if (!widget.contentChanged) {
            visibleWidget = me.widget.transform.layout.firstVisibleWidget(widget.var.layout);
        }
        widget.forceReflow = false;
        widget.contentChanged = false;
        widget.pageSize = me.widget.transform.layout.pageSize(widget.var.layout);
        me.core.property.set(widget.var.spinner, "text", "Layout");
        var window = me.widget.window(object);
        var fullscreen = me.core.property.get(window, "fullscreen");
        widget.fullscreen = fullscreen;
        me.core.property.set(widget, "ui.work.state", true);
        widget.var.layout.style.opacity = 0;
        if (widget.options.pages) {
            widget.var.layout.style.margin = "";
        } else {
            widget.var.layout.style.margin = "20px 40px";
        }
        var columnCount = widget.options.columns ? 2 : 1;
        var reflowOptions = {
            usePages: widget.options.pages,
            columnCount: columnCount,
            columnWidth: "400px",
            scrollWidget: visibleWidget,
            scrollPos: widget.options.scrollPos,
            playEnabled: widget.options.voice !== "None"
        };
        widget.diagrams = [];
        me.media.voice.stop();
        me.widget.transform.layout.reflow(function () {
            me.core.property.set(widget, "ui.work.state", false);
            if (widget.useTitle) {
                var title = me.core.property.get(widget, "widget.transform.title");
                me.core.property.set(widget, "widget.window.title", title);
            }
        }, widget.var.output, widget.var.layout, reflowOptions);
    };
    me.scrolled = {
        set: function (object, value) {
            var widget = me.findWidget(object);
            if (me.core.property.get(widget, "ui.work.state") || me.core.property.get(widget, "conceal")) {
                return;
            }
            me.widget.transform.layout.updatePages(widget.var.layout);
            if (widget.scrolledTimer) {
                clearTimeout(widget.scrolledTimer);
            }
            widget.scrolledTimer = setTimeout(function () {
                if (me.core.property.get(widget, "ui.work.state") || me.core.property.get(widget, "conceal")) {
                    return;
                }
                if (value && "vertical" in value) {
                    me.core.property.set(widget, "widget.transform.scrollPos", value.vertical);
                }
            }, 2000);
            me.core.property.set([widget.var.scrollToTop, widget.var.previousPage], "ui.class.disabled", !widget.var.layout.scrollTop);
            me.core.property.set([widget.var.nextPage], "ui.class.disabled", me.ui.scroll.isLastPage(widget.var.layout));
        }
    };
    me.resetDescription = function (object) {
        var descriptionTypes = ["explanation", "technical", "source", "related"];
        descriptionTypes.map(function (descriptionType) {
            var descriptionBox = me.ui.node.findById(object, descriptionType);
            if (descriptionBox) {
                me.core.property.set(descriptionBox, "ui.class.remove", "show");
                descriptionBox.resetTimer = setTimeout(function () {
                    me.core.property.set(descriptionBox, "ui.style.display", "none");
                }, 1000);
            }
        });
    };
    me.diagramList = {
        get: function (object) {
            var widget = me.findWidget(object);
            var diagrams = widget.diagrams;
            if (!diagrams) {
                diagrams = [];
            }
            if (widget.tableOfPhases) {
                diagrams.unshift({ title: "Table of Phases", path: "table_of_phases", params: me.tableOfPhasesParams(widget) });
            }
            var isFirst = true;
            var items = diagrams.map(function (item) {
                var result = [
                    item.title,
                    function () {
                        var window = me.widget.window(widget);
                        me.core.app("diagram", item.path, widget.options, null, item.params);
                    },
                    {
                        separator: isFirst,
                        enabled: widget.transformText !== null
                    }
                ];
                if (isFirst) {
                    isFirst = false;
                }
                return result;
            });
            return items;
        }
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
    me.fontSizes = function (object, method) {
        var fontSizeList = [];
        for (var fontSize = 8; fontSize <= 32; fontSize += 2) {
            var item = [
                fontSize + "px",
                method,
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
    me.updateWidgets = function (object, hasText, update = true) {
        var widget = me.findWidget(object);
        me.core.property.set([widget.var.output, widget.var.layout], {
            "ui.style.fontSize": widget.options.fontSize
        });
        if (update) {
            me.core.property.notify(widget, "update");
        }
    };
    me.classes = {
        root: "kab-term-phase-root",
        one: "kab-term-phase-one",
        two: "kab-term-phase-two",
        three: "kab-term-phase-three",
        four: "kab-term-phase-four",
        collective: "kab-term-phase-collective"
    };
    me.phases = {
        root: 2,
        one: 3,
        two: 4,
        three: 5,
        four: 6,
        collective: 7
    };
    me.addTerms = function (terms, rows, used) {
        for (var name in terms) {
            var term = terms[name];
            if (term.heading && term.phase) {
                var phase = term.phase;
                if (typeof phase !== "string") {
                    if (phase.minor) {
                        phase = phase.minor;
                    } else {
                        phase = phase.major;
                    }
                }
                term.heading.split("/").map(function (heading) {
                    var row = rows[heading];
                    if (!row) {
                        row = rows[heading] = {};
                    }
                    if (used !== term.used) {
                        return;
                    }
                    if (!term.used && !Object.keys(row).length) {
                        return;
                    }
                    var list = row[phase];
                    if (!list) {
                        list = row[phase] = [];
                    }
                    list.push(term.term);
                });
            }
        }
    };
    me.tableOfPhasesParams = function (object) {
        var params = { gridData: [] };
        var widget = me.findWidget(object);
        var rows = {};
        if (!widget.tableOfPhases) {
            return params;
        }
        var terms = widget.tableOfPhases.terms;
        console.log("terms: " + JSON.stringify(terms));
        me.addTerms(terms, rows, true);
        me.addTerms(terms, rows, false);
        var rowIndex = 2;
        for (var phase in me.phases) {
            var columnIndex = me.phases[phase];
            var name = phase.charAt(0).toUpperCase() + phase.slice(1);
            params.gridData.push([1, columnIndex, name, "kab.term.header"]);
        }
        for (var heading in rows) {
            var row = rows[heading];
            var name = heading.charAt(0).toUpperCase() + heading.slice(1);
            var found = false;
            for (var phase in me.phases) {
                var list = row[phase];
                if (!list || !list.length) {
                    continue;
                }
                var columnIndex = me.phases[phase];
                params.gridData.push([rowIndex, columnIndex, list, me.classes[phase]]);
                found = true;
            }
            if (!found) {
                continue;
            }
            params.gridData.push([rowIndex, 1, name, "kab.term.header"]);
            rowIndex++;
        }
        for (var row of params.gridData) {
            for (const [i, field] of row.entries()) {
                if (Array.isArray(field)) {
                    row[i] = Array.from(new Set(field));
                }
            }
        }
        console.log("params.gridData: " + JSON.stringify(params.gridData));
        return params;
    };
    me.term = {
        set: async function (object, text) {
            var widget = me.findWidget(object);
            var options = Object.assign({}, widget.options, { headings: false });
            var info = await me.kab.text.parse(widget.language, text, options);
            me.core.property.set(object, "ui.basic.html", info.text);
        }
    };
    me.updateScrolling = function (object) {
        var widget = me.findWidget(object);
        var pageSize = me.widget.transform.layout.pageSize(widget.var.layout);
        me.core.property.set(widget.var.layout, {
            "ui.scroll.pageSize": pageSize.height,
            "ui.scroll.scrollTo": widget.options.scrollPos,
            "ui.scroll.scrolled": null
        });
    };
    me.clear = function (object) {
        var widget = me.findWidget(object);
        widget.transformText = "";
        me.core.property.set(widget.var.output, "ui.basic.html", "");
        me.widget.transform.layout.clear(widget.var.layout);
        me.updateWidgets(widget, true);
        widget.options.scrollPos = 0;
        me.core.property.set(widget.var.layout, "ui.style.display", "none");
        me.transform(object);
    };
    me.contentTitle = {
        get: function (object) {
            var widget = me.findWidget(object);
            var title = me.widget.transform.layout.firstWidget(widget.var.layout);
            if (title && title.tagName && title.tagName.toLowerCase() === "h4") {
                title = title.innerText;
                widget.contentTitle = title;
                return title;
            }
            else {
                title = widget.contentTitle;
            }
            return title;
        }
    };
    me.title = {
        get: function (object) {
            var widget = me.findWidget(object);
            var window = me.widget.window(widget);
            var title = me.core.property.get(widget, "widget.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if (title) {
                return key + " - " + title;
            }
            return key;
        }
    };
};

screens.widget.transform.player = function WidgetTransformPlayer(me) {
    me.changeVoice = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = me.media.voice.isPlaying(currentPage);
        var isPaused = me.media.voice.isPaused(currentPage);
        var playWillEnable = widget.options.voice !== "None";
        var playEnabled = me.widget.transform.layout.options(widget.var.layout).playEnabled;
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
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = me.media.voice.isPlaying(currentPage);
        var isPaused = me.media.voice.isPaused(currentPage);
        if (isPlaying && !isPaused) {
            me.play(object, me.media.voice.currentIndex, false);
        }
    };
    me.pause = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        me.focusParagraph(object, null);
        me.media.voice.pause();
        me.widget.transform.layout.setPlayState(currentPage, true, true);
    };
    me.play = function (object, value, toggle=true) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        var isPaused = me.media.voice.isPaused(currentPage);
        if (toggle && isPlaying && isPaused) {
            me.media.voice.resume();
            me.widget.transform.layout.setPlayState(me.currentPlayingPage, true, false);
            var focusElement = me.widget.transform.layout.focusElement(me.currentPlayingPage);
            me.focusParagraph(object, focusElement);
        }
        else {
            var index = 0;
            if (typeof value === "number") {
                index = value;
            }
            var text = me.widget.transform.layout.pageText(currentPage);
            var params = {
                index: index,
                onstart: () => {
                    me.log("onstart");
                    me.widget.transform.layout.setPlayState(currentPage, true, false);
                    me.focusParagraph(object, null);
                },
                oncancel: () => {
                    me.log("oncancel");
                    me.widget.transform.layout.clearPage(currentPage);
                    me.widget.transform.layout.setPlayState(currentPage, false, false);
                    me.focusParagraph(object, null);
                },
                onend: () => {
                    me.log("onend");
                    me.widget.transform.layout.clearPage(currentPage);
                    me.widget.transform.layout.setPlayState(currentPage, false, false);
                    me.focusParagraph(object, null);
                    if (widget.options.autoPlay) {
                        if (!currentPage.last) {
                            setTimeout(() => {
                                me.core.property.set(object, "ui.scroll.nextPage");
                                setTimeout(() => {
                                    me.core.property.set(object, "widget.transform.player.play");
                                }, 1000);
                            }, 1000);
                        }
                    }
                },
                onprevious: () => {
                    var pageNumber = me.core.property.get(currentPage, "ui.attribute.pageNumber");
                    if (pageNumber > 1) {
                        me.widget.transform.layout.clearPage(currentPage);
                        me.focusParagraph(object, null);
                        me.core.property.set(object, "ui.scroll.previousPage");
                        me.core.property.set(object, "widget.transform.player.play", -1);
                    }
                    else {
                        me.media.voice.replay();
                    }
                },
                onnext: () => {
                    me.widget.transform.layout.clearPage(currentPage);
                    if (currentPage.last) {
                        me.widget.transform.layout.setPlayState(currentPage, false, false);
                        me.focusParagraph(object, null);
                        me.currentPlayingPage = null;
                    }
                    else {
                        me.core.property.set(object, "ui.scroll.nextPage");
                        me.core.property.set(object, "widget.transform.player.play");
                    }
                },
                onchange: (index, text) => {
                    me.log("onchange: " + index + " text:" + text);
                    me.widget.transform.layout.markPage(currentPage, index, text);
                    var focusElement = me.widget.transform.layout.focusElement(currentPage);
                    me.focusParagraph(object, focusElement);
                },
                rate: widget.options.speed,
                language: widget.language
            };
            me.media.voice.play(text, widget.options.voice, params);
            if (me.currentPlayingPage && me.currentPlayingPage !== currentPage) {
                me.widget.transform.layout.setPlayState(me.currentPlayingPage, false, false);
                me.currentPlayingPage = null;
            }
            me.currentPlayingPage = currentPage;
        }
    };
    me.stop = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.stop();
            me.widget.transform.layout.clearPage(currentPage);
            me.focusParagraph(object, null);
            me.widget.transform.layout.setPlayState(currentPage, false, false);
            me.currentPlayingPage = null;
        }
    };
    me.rewind = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.rewind();
        }
    };
    me.fastforward = function (object) {
        var widget = me.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
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
        speedList = speedList.map(name => {
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
            return item;
        });
        return speedList;
    };
    me.focusParagraph = function (object, paragraph) {
        var widget = me.findWidget(object);
        if (!widget) {
            return;
        }
        var fontSize = (parseInt(widget.options.fontSize) + 4) + "px";
        if (widget.options.playingPopup) {
            if (widget.playingPopupParagraph != paragraph) {
                if (widget.playingPopupHandle) {
                    me.core.property.set(widget.playingPopupHandle, "show", false);
                }
                if (paragraph) {
                    if (widget.playingPopupHandle) {
                        me.core.property.set(widget.playingPopupHandle, "show", true);
                        me.core.property.set(widget.playingPopupHandle, "modal.playing.layout", paragraph.innerHTML);
                        me.core.property.set(widget.playingPopupHandle, "modal.playing.fontSize", fontSize);
                        me.core.property.set(widget.playingPopupHandle, "ui.style.top", widget.options.pipVideo ? "15%" : "5%");
                        me.core.property.set(widget.playingPopupHandle, "ui.style.height", widget.options.pipVideo ? "80%" : "90%");
                    }
                    else {
                        var title = me.core.property.get(widget, "widget.transform.contentTitle");
                        widget.playingPopupHandle = me.ui.modal("playing", {
                            "title": title,
                            "layout": paragraph.innerHTML,
                            "fontSize": fontSize,
                            "top": widget.options.pipVideo ? "20%" : "5%",
                            "height": widget.options.pipVideo ? "75%" : "90%"
                        });
                    }
                }
            }
        }
        else if (widget.playingPopupHandle) {
            me.core.property.set(widget.playingPopupHandle, "show", false);
        }
        widget.playingPopupParagraph = paragraph;
    };
};

screens.widget.transform.layout = function WidgetTransformLayout(me) {
    me.move = function (source, target) {
        do {
            var widget = source.firstChild;
            if (widget) {
                target.appendChild(widget);
            }
        } while (widget);
    };
    me.clear = function (target) {
        do {
            var widget = target.firstChild;
            if (widget) {
                target.removeChild(widget);
            }
        } while (widget);
    };
    me.prepare = function (source, target) {
        do {
            var widget = target.firstChild;
            if (widget) {
                if (widget.var && widget.var.content) {
                    var content = widget.var.content;
                    do {
                        var childWidget = content.firstChild;
                        if (childWidget) {
                            source.appendChild(childWidget);
                            if (childWidget.style) {
                                childWidget.style.fontSize = "";
                            }
                        }
                    } while (childWidget);
                    widget.var.content.parentNode.removeChild(widget.var.content);
                    widget.var.content = null;
                    target.removeChild(widget);
                } else {
                    source.appendChild(widget);
                    if (widget.style) {
                        widget.style.fontSize = "";
                    }
                }
            }
        } while (widget);
    };
    me.pageSize = function (target) {
        var container = me.ui.node.container(target, me.widget.container.id);
        var pageHeight = container.offsetHeight;
        var pageWidth = container.parentNode.offsetWidth;
        return { width: pageWidth, height: pageHeight };
    };
    me.firstPage = function (target) {
        var page = target.firstChild;
        return page;
    };
    me.firstVisiblePage = function (target) {
        var page = null;
        var widget = target.firstChild;
        while (widget) {
            if (widget.offsetTop >= target.scrollTop) {
                page = widget;
                break;
            }
            widget = widget.nextSibling;
        }
        return page;
    };
    me.firstWidget = function (target) {
        var page = me.firstPage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div") {
                return page.var.content.firstChild;
            }
        }
        return page;
    };
    me.firstVisibleWidget = function (target) {
        var page = me.firstVisiblePage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div") {
                return page.var.content.firstChild;
            }
        }
        return page;
    };
    me.scrollToWidget = function (widget, target) {
        if (widget) {
            var parent = widget.parentNode;
            while (parent) {
                if (parent.parentNode === target) {
                    me.core.property.set(target, "ui.scroll.to", parent.offsetTop);
                    break;
                }
                parent = parent.parentNode;
            }
        }
    };
    me.options = function (target) {
        return target.options;
    };
    me.reflow = function (callback, source, target, options) {
        var layoutContent = target;
        layoutContent.options = options;
        if (target.reflowInterval) {
            clearInterval(target.reflowInterval);
            target.reflowInterval = null;
            me.move(source, me.page ? me.page.var.content : layoutContent);
            if (!target.notified && callback) {
                callback(false);
            }
        }
        target.page = null;
        me.prepare(source, layoutContent);
        var pageSize = me.pageSize(layoutContent);
        if (!source.firstChild) {
            if (callback) {
                callback(true);
            }
            return;
        }
        target.notified = false;
        var pageIndex = 1;
        var pageContent = null;
        if (options.usePages) {
            target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
            pageContent = target.page.var.content;
        }
        var previousWidget = null, visibleWidget = null;
        var showInProgress = false;
        target.reflowInterval = setInterval(function () {
            var window = me.widget.window(target);
            for (; ;) {
                var concealed = me.core.property.get(window, "conceal");
                var widget = source.firstChild;
                if (!widget || concealed) {
                    clearInterval(target.reflowInterval);
                    target.reflowInterval = null;
                    if (options.usePages) {
                        me.applyNumPages(layoutContent, pageIndex);
                    }
                    me.completePage(target.page, options);
                    if (target.page) {
                        target.page.last = true;
                        target.page.var.separator.style.display = "block";
                        target.page.var.pageNext.style.opacity = "0.0";
                        me.core.property.set(target.page.var.separator, "ui.class.add", "last");
                    }
                    me.completeReflow(callback, target, options, false);
                    me.updatePages(target);
                    break;
                }
                if (options.scrollWidget) {
                    if (visibleWidget === options.scrollWidget) {
                        showInProgress = true;
                    }
                } else if (options.scrollPos < layoutContent.scrollHeight) {
                    showInProgress = true;
                }
                var location = pageContent ? pageContent : layoutContent;
                if (widget.style && widget.style.order) {
                    location.insertBefore(widget, me.widgetByOrder(location, widget.style.order));
                } else {
                    location.appendChild(widget);
                }
                visibleWidget = widget;
                if (!target.page) {
                    if (showInProgress) {
                        me.completeReflow(callback, target, options);
                    }
                    break;
                }
                var newPage = false;
                me.cleanupWidget(widget);
                newPage = !me.widgetFitInPage(widget, target.page);
                if (widget.tagName && widget.tagName.toLowerCase() === "hr") {
                    previousWidget = null;
                }
                else if (widget.tagName && widget.tagName.toLowerCase() === "br") {
                    newPage = true;
                    widget = null;
                    previousWidget = null;
                    if (target.page) {
                        target.page.var.separator.style.display = "block";
                    }
                } else if (!(widget.textContent || widget.firstChild)) {
                    pageContent.removeChild(widget);
                    widget = null;
                    newPage = false;
                }
                if (newPage) {
                    if (widget) {
                        pageContent.removeChild(widget);
                    }
                    pageIndex++;
                    me.completePage(target.page, options);
                    target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
                    pageContent = target.page.var.content;
                    if (previousWidget && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                        pageContent.appendChild(previousWidget);
                    }
                    if (widget) {
                        pageContent.appendChild(widget);
                    }
                    for (var fontSize = parseInt(target.style.fontSize); fontSize >= 8; fontSize -= 2) {
                        if (me.widgetFitInPage(null, target.page)) {
                            break;
                        }
                        target.page.style.fontSize = fontSize + "px";
                        target.page.style.lineHeight = "2em";
                    }
                    previousWidget = null;
                    me.activateOnLoad(target.page ? target.page : widget, widget);
                    if (showInProgress) {
                        me.completeReflow(callback, target, options);
                    }
                    me.core.property.set(target, "update");
                    break;
                } else if (widget) {
                    previousWidget = widget;
                    me.activateOnLoad(target.page ? target.page : widget, widget);
                }
            }
        }, 0);
    };
    me.widgetFitInContainer = function (widget, container) {
        var result = true;
        if (container.scrollWidth > container.offsetWidth) {
            result = false;
        }
        if (container.scrollHeight > container.offsetHeight) {
            result = false;
        }
        return result;
    };
    me.widgetFitInPage = function (widget, page) {
        var pageContent = page.var.content;
        var pageContainer = page.var.container;
        var result = true;
        result = me.widgetFitInContainer(widget, page);
        result = result && me.widgetFitInContainer(widget, pageContainer);
        result = result && me.widgetFitInContainer(widget, pageContent);
        return result;
    };
    me.completeReflow = function (callback, target, options, scrollToWidget = true) {
        if (!target.notified && callback) {
            callback(true);
            target.notified = true;
            if (options.scrollWidget && scrollToWidget) {
                me.scrollToWidget(options.scrollWidget, target);
            }
            me.core.property.set(target, "update");
        }
    };
    me.widgetByOrder = function (page, order) {
        var widget = page.firstChild;
        var match = null;
        while (widget) {
            if (widget.style.order) {
                if (parseInt(widget.style.order) > parseInt(order)) {
                    match = widget;
                    break;
                }
            }
            widget = widget.nextSibling;
        }
        return match;
    };
    me.createPage = function (target, pageWidth, pageHeight, pageIndex, options) {
        var modifiers = me.modifiers(target);
        var page = me.ui.element({
            "ui.basic.tag": "div",
            "ui.class.class": ["widget.transform.page", modifiers],
            "ui.style.width": pageWidth + "px",
            "ui.style.height": pageHeight + "px",
            "ui.style.visibility": "hidden",
            "ui.attribute.pageNumber": pageIndex,
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": ["widget.transform.page.header", modifiers],
                    "ui.basic.var": "header",
                    "ui.style.width": pageWidth + "px",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": ["widget.transform.page.number", modifiers],
                            "ui.basic.var": "pageNumber",
                            "ui.attribute.shortPageNumberText": pageIndex,
                            "ui.attribute.longPageNumberText": pageIndex
                        }
                    ]
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": ["widget.transform.page.container", modifiers],
                    "ui.basic.var": "container",
                    "ui.style.overflow": "hidden",
                    "ui.basic.elements": {
                        "ui.basic.tag": "div",
                        "ui.class.class": ["widget.transform.page.content", modifiers],
                        "ui.style.columns": options.columnCount + " " + options.columnWidth,
                        "ui.basic.var": "content"
                    }
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": [
                        "widget.transform.separator",
                        modifiers
                    ],
                    "ui.basic.var": "separator",
                    "ui.style.display": "none"
                }
            ]
        }, target, "self");
        page.options = options;
        return page;
    };
    me.createBreak = function (target) {
        var page = me.ui.element({
            "ui.basic.tag": "br"
        }, target);
        return page;
    };
    me.previousPage = {
        set: function (object) {
            var widget = me.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.previousPage");
        }
    };
    me.nextPage = {
        set: function (object) {
            var widget = me.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.nextPage");
        }
    };
    me.scrollToTop = {
        set: function (object) {
            var widget = me.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.to", 0);
        }
    };
    me.applyNumPages = function (target, numPages) {
        var widget = target.firstChild;
        while (widget) {
            if (widget.var && widget.var.pageNumber) {
                var pageNumber = me.core.property.get(widget, "ui.attribute.pageNumber");
                me.core.property.set(widget.var.pageNumber, "ui.attribute.longPageNumberText", pageNumber + "/" + numPages);
            }
            widget = widget.nextSibling;
        }
    };
    me.completePage = function (page, options) {
        var showPage = true;
        if (!page) {
            return;
        }
        var pageNumber = me.core.property.get(page, "ui.attribute.pageNumber");
        if (pageNumber === "1" || showPage) {
            page.style.display = "flex-inline";
            page.style.visibility = "visible";
            page.pageOffset = page.offsetTop;
            page.pageSize = page.clientHeight;
        } else {
            page.style.display = "none";
        }
        me.clearPage(page);
    };
    me.pageInView = function (page, partial = true) {
        let parentTop = page.parentNode.scrollTop;
        let parentBottom = parentTop + page.parentNode.clientHeight;
        let childTop = page.pageOffset;
        let childBottom = childTop + page.pageSize;
        let isTotal = (childTop >= parentTop && childBottom <= parentBottom);
        let isPartial = partial && ((childBottom > parentTop) ||
            (childTop < parentBottom));
        return (isTotal || isPartial);
    };
    me.pageApply = function (target, callback) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                callback(child);
            }
            child = child.nextSibling;
        }
    };
    me.updatePages = function (target) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                var pageInView = me.pageInView(child);
                var childInView = child.inView || false;
                if (pageInView !== childInView) {
                    if (pageInView) {
                        child.var.content.style.display = "";
                        child.style.visibility = "visible";
                    } else {
                        child.var.content.style.display = "none";
                        child.style.visibility = "hidden";
                    }
                    child.inView = pageInView;
                }
            }
            child = child.nextSibling;
        }
    };
    me.activateOnLoad = function (parent, widget) {
        if (!widget) {
            return;
        }
        var child = widget.firstChild;
        while (child) {
            me.activateOnLoad(parent, child);
            child = child.nextSibling;
        }
        if (widget && widget.getAttribute) {
            var onload = widget.getAttribute("onload");
            if (onload) {
                me.core.property.set(parent, onload);
            }
        }
    };
    me.cleanupWidget = function (widget) {
        var child = widget.firstChild;
        while (child) {
            if (child.tagName && child.tagName.toLowerCase() === "div") {
                widget.removeChild(child);
                child = widget.firstChild;
            }
            if (child) {
                child = child.nextSibling;
            }
        }
        widget.style.border = "1px solid transparent";
    };
    me.currentPage = function (target) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                var pageInView = me.pageInView(child, false);
                if (pageInView) {
                    return child;
                }
            }
            child = child.nextSibling;
        }
        return null;
    };
    me.pageText = function (page) {
        var content = page.var.content;
        var array = Array.from(content.children).map(el => {
            if (el.getAttribute("hidden")) {
                return "";
            }
            var text = el.innerText;
            return text;
        });
        return array;
    };
    me.isPlaying = function (page) {
        var isPlaying = me.core.property.get(page.var.play, "ui.class.contains", "play");
        return isPlaying;
    };
    me.isPaused = function (page) {
        var isPaused = me.core.property.get(page.var.play, "ui.class.contains", "pause");
        return isPaused;
    };
    me.setPlayState = function (page, play, pause) {
        var widget = me.findWidget(page);
        var widgets = me.ui.node.childList(widget.var.iconbar);
        me.core.property.set(widgets, "ui.class.play", play);
        me.core.property.set(widgets, "ui.class.pause", pause);
    };
    me.hasSeparator = function (page) {
        var hasSeparator = false;
        if (page) {
            if (page.var.separator.style.display !== "none") {
                hasSeparator = true;
            }
        }
        return hasSeparator;
    };
    me.markElement = function (element, mark) {
        if (mark) {
            element.style.opacity = "";
        }
        else {
            element.style.opacity = "0.5";
        }
    };
    me.clearPage = function (page) {
        var content = page.var.content;
        var modifiers = me.modifiers(page);
        Array.from(content.children).map(element => {
            if (element.getAttribute('hidden')) {
                return;
            }
            me.markElement(element, true);
            if (element.innerText) {
                me.core.property.set(element, "ui.class.add", ["widget.transform.widget", modifiers]);
            }
            element.classList.remove("mark");
        });
        page.focusElement = null;
    };
    me.markPage = function (page, index, text) {
        var content = page.var.content;
        var focusElement = null;
        focusElement = content.children[index];
        Array.from(content.children).map(element => {
            if (element.getAttribute('hidden')) {
                return;
            }
            if (element === focusElement) {
                return;
            }
            me.markElement(element, false);
        });
        if (page.focusElement !== focusElement) {
            if (page.focusElement) {
                me.markElement(page.focusElement, false);
                page.focusElement.classList.remove("mark");
            }
            if (focusElement) {
                me.markElement(focusElement, true);
                focusElement.classList.add("mark");
            }
            page.focusElement = focusElement;
        }
    };
    me.focusElement = function (page) {
        return page.focusElement;
    };
};
