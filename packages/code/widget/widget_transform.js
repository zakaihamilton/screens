/*
 @author Zakai Hamilton
 @component WidgetTransform
 */

screens.widget.transform = function WidgetTransform(me) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
    };
    me.initOptions = function (object) {
        var widget = me.findWidget(object);
        widget.language = null;
        me.ui.options.load(me, widget, {
            doTranslation: false,
            doExplanation: true,
            prioritizeExplanation: true,
            addStyles: true,
            abridged: true,
            keepSource: false,
            category: true,
            headings: true,
            subHeadings: true,
            pages: true,
            snap: true,
            columns: true,
            language: "Auto",
            fontSize: "18px",
            scrollPos: 0,
            phaseNumbers: true,
            pipVideo: false,
            autoPlay: true,
            voiceEnglish: "Google UK English Male",
            voiceHebrew: "None",
            speed: "Normal",
            volume: "Normal",
            singleArticle: false,
            commentaryEdit: false,
            commentaryLabel: true,
            commentarySeparator: true,
            commentaryUser: "",
            showHighlights: true,
            copyHighlights: true,
            exportSource: false
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
            snap: (object) => {
                var widget = me.findWidget(object);
                me.core.property.set(widget.var.layout, {
                    "ui.scroll.snap": widget.options.snap,
                    "ui.scroll.scrolled": null
                });
            },
            columns: me.reflow,
            category: me.transform,
            headings: me.transform,
            subHeadings: me.transform,
            diagrams: me.transform,
            pipVideo: me.reflow,
            autoPlay: null,
            singleArticle: null,
            commentaryEdit: me.transform,
            commentaryLabel: me.transform,
            commentarySeparator: me.transform,
            showHighlights: me.transform,
            copyHighlights: null,
            exportSource: null
        });
        me.ui.options.choiceSet(me, me.findWidget, {
            language: me.transform,
            fontSize: (object, value) => {
                var widget = me.findWidget(object);
                me.core.property.set([widget.var.layout], "ui.style.fontSize", value);
                widget.forceReflow = true;
                me.core.property.notify(widget, "update");
            },
            voiceEnglish: me.player.changeVoice,
            voiceHebrew: me.player.changeVoice,
            speed: me.player.updatePlayback,
            volume: me.player.updatePlayback,
            scrollPos: null,
            commentaryUser: me.transform
        });
    };
    me.findWidget = function (object) {
        var widget = me.ui.node.container(object, me.id);
        if (!widget) {
            var window = me.widget.window.get(object);
            if (window) {
                widget = window.var.transform;
                if (!widget) {
                    widget = window;
                }
            }
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
        me.widget.transform.layout.clear(widget.var.layout);
        var text = widget.transformText;
        widget.contentTitle = "";
        me.updateWidgets(widget, text, false);
        widget.inTransform = true;
        me.core.property.set(widget.var.spinner, "text", "Transform");
        me.core.property.set(widget, "ui.work.state", true);
        var language = widget.options.language.toLowerCase();
        if (language === "auto") {
            if (text && text.startsWith("<")) {
                language = "none";
            }
            else {
                language = me.core.string.language(text);
            }
            me.log("detected language: " + language);
        }
        widget.options.clickCallback = "screens.widget.transform.popup.open";
        widget.options.diagramCallback = "screens.widget.transform.loadDiagram";
        widget.options.reload = true;
        me.media.voice.stop();
        var options = Object.assign({}, widget.options, { nightMode: me.ui.theme.options.nightMode });
        var info = { text, terms: {}, data: null };
        if (language !== "none") {
            info = await me.kab.text.parse(language, text, options, (percent) => {
                me.core.property.set(widget.var.spinner, "percent", percent);
            });
        }
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
            widget.termData = { terms, data };
        }
        else {
            widget.termData = null;
        }
        me.core.property.set(widget.var.output, "ui.style.display", "none");
        me.core.property.set(widget.var.layout, "ui.style.display", text ? "" : "none");
        me.widget.transform.layout.move(widget.var.output, widget.var.layout);
        widget.forceReflow = true;
        widget.contentChanged = true;
        widget.inTransform = false;
        await me.core.property.set(widget, "update");
        me.core.property.set(widget, "ui.work.state", false);
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
        var window = me.widget.window.get(object);
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
        if (!widget) {
            return [];
        }
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
    me.update = async function (object) {
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
        var visibleWidget = null;
        if (!widget.contentChanged) {
            visibleWidget = me.widget.transform.layout.firstVisibleWidget(widget.var.layout);
        }
        widget.forceReflow = false;
        widget.contentChanged = false;
        widget.pageSize = me.widget.transform.layout.pageSize(widget.var.layout);
        me.core.property.set(widget.var.spinner, "text", "Layout");
        var window = me.widget.window.get(object);
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
            playEnabled: widget.options.voiceEnglish !== "None" || widget.options.voiceHebrew !== "None",
            language: widget.options.language
        };
        widget.diagrams = [];
        me.media.voice.stop();
        await me.widget.transform.layout.reflow(widget.var.output, widget.var.layout, reflowOptions);
        me.core.property.set(widget, "ui.work.state", false);
        var name = me.core.property.get(widget, "widget.transform.name");
        me.core.property.set(widget, "widget.window.name", name);
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
    me.diagramList = {
        get: function (object) {
            var widget = me.findWidget(object);
            var diagrams = widget.diagrams;
            if (!diagrams) {
                diagrams = [];
            }
            if (widget.termData && (!diagrams[0] || diagrams[0].title !== "Table of Phases")) {
                diagrams.unshift({ title: "Table of Phases", path: "table_of_phases", params: me.tableOfPhasesParams(widget) });
            }
            diagrams = me.core.json.union(diagrams, "title");
            var items = diagrams.map(function (item) {
                var result = {
                    text: item.title,
                    select: function () {
                        me.core.app.launch("diagram", item.path, widget.options, null, item.params);
                    },
                    options: {
                        enabled: widget.transformText !== null
                    }
                };
                return result;
            });
            items = items.filter(Boolean);
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
    me.fontSizesPx = function (object, method) {
        var fontSizeList = [];
        var fontSize = 0;
        var item = null;
        for (fontSize = 8; fontSize <= 32; fontSize += 2) {
            item = [
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
    me.fontSizesEm = function (object, method) {
        var fontSizeList = [];
        var fontSize = 0;
        var item = null;
        for (fontSize = 1; fontSize < 8; fontSize += 0.5) {
            item = [
                fontSize + "em",
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
        root: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        collective: 5
    };
    me.addTerms = function (terms, rows, used) {
        for (var name in terms) {
            var term = terms[name];
            if (term.category && term.phase) {
                var phase = term.phase;
                if (typeof phase !== "string") {
                    if (phase.minor) {
                        phase = phase.minor;
                    } else {
                        phase = phase.major;
                    }
                }
                term.category.split("/").map(function (category) {
                    var row = rows[category];
                    if (!row) {
                        row = rows[category] = {};
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
        if (!widget.termData) {
            return params;
        }
        var terms = widget.termData.terms;
        me.addTerms(terms, rows, true);
        me.addTerms(terms, rows, false);
        var rowIndex = 2;
        for (let phase in me.phases) {
            var columnIndex = me.phases[phase] + 2;
            var name = phase.charAt(0).toUpperCase() + phase.slice(1);
            params.gridData.push([1, columnIndex, name, "kab.term.header"]);
        }
        for (var category in rows) {
            let row = rows[category];
            let name = category.charAt(0).toUpperCase() + category.slice(1);
            var found = false;
            for (let phase in me.phases) {
                var list = row[phase];
                if (!list || !list.length) {
                    continue;
                }
                let columnIndex = me.phases[phase] + 2;
                params.gridData.push([rowIndex, columnIndex, list, me.classes[phase]]);
                found = true;
            }
            if (!found) {
                continue;
            }
            params.gridData.push([rowIndex, 1, name, "kab.term.header"]);
            rowIndex++;
        }
        for (let row of params.gridData) {
            for (const [i, field] of row.entries()) {
                if (Array.isArray(field)) {
                    row[i] = Array.from(new Set(field));
                }
            }
        }
        return params;
    };
    me.updateScrolling = function (object) {
        var widget = me.findWidget(object);
        var pageSize = me.widget.transform.layout.pageSize(widget.var.layout);
        me.core.property.set(widget.var.layout, {
            "ui.scroll.pageSize": pageSize.height,
            "ui.scroll.scrollTo": widget.options.scrollPos,
            "ui.scroll.scrolled": null,
            "ui.scroll.snap": widget.options.snap
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
    me.name = {
        get: function (object) {
            var widget = me.findWidget(object);
            var window = me.widget.window.get(widget);
            var title = me.core.property.get(widget, "widget.transform.contentTitle");
            var key = me.core.property.get(window, "widget.window.key");
            if (title) {
                return title;
            }
            return key;
        }
    };
    me.commentaryUsers = function (object) {
        var info = {
            list: me.db.shared.commentary.users(),
            group: "users",
            itemMethod: "widget.transform.commentaryUser",
            options: { "state": "select" }
        };
        return me.widget.menu.collect(object, info);
    };
    me.transformedText = function (object, useFilter, useSource) {
        var widget = me.findWidget(object);
        var list = [];
        me.widget.transform.layout.pageApply(widget.var.layout, (page) => {
            var filter = null;
            if (useFilter) {
                filter = (element) => {
                    return me.core.property.get(element, "ui.class.kab-term-highlight");
                };
            }
            var modify = (element, text) => {
                if (useSource) {
                    text = me.core.property.get(element, "ui.attribute.#source");
                }
                if (text) {
                    if (element.tagName && element.tagName.toLowerCase() === "h4") {
                        text = "\n" + text;
                    }
                    else {
                        text = "\n\n" + text;
                    }
                }
                return text;
            };
            var paragraphs = me.widget.transform.layout.pageText(page, filter, modify);
            paragraphs = paragraphs.filter(Boolean);
            if (paragraphs && paragraphs.length) {
                list.push(paragraphs.join(""));
            }
        });
        return list.join("").trim();
    };
    me.exportText = function (object, target) {
        var widget = me.findWidget(object);
        var text = "";
        if (widget.options.showHighlights && widget.options.copyHighlights) {
            text = me.transformedText(object, true, widget.options.exportSource);
        }
        if (!text) {
            text = me.transformedText(object, false);
        }
        me.core.property.set(target, "importData", text);
    };
    me.visualize = function (object) {
        var widget = me.findWidget(object);
        var window = me.widget.window.get(widget);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var terms = [];
        me.ui.node.iterate(currentPage, (element) => {
            var term = me.core.property.get(element, "ui.attribute.kab-term");
            if (term) {
                terms.push(term);
            }
        });
        terms = Array.from(new Set(terms));
        terms = terms.map(term => {
            return [term];
        });
        var fullscreen = me.core.property.get(window, "fullscreen");
        var params = {
            terms,
            fullscreen
        };
        me.core.app.launch("visualize", params);
    };
    me.removeHighlights = function (object) {
        var widget = me.findWidget(object);
        me.ui.node.iterate(widget.var.layout, (element) => {
            me.kab.highlight.remove(element);
        });
    };
};

screens.widget.transform.popup = function WidgetTransformPopup(me) {
    me.init = function () {
        me.counter = 0;
    };
    me.open = async function (object, termName) {
        var widget = me.upper.findWidget(object);
        var foundTermName = Object.keys(widget.termData.terms).find((term) => {
            return term.replace(/\s+/g, "") === termName.replace(/\s+/g, "");
        });
        if (foundTermName && termName !== foundTermName) {
            termName = foundTermName;
        }
        var term = widget.termData.terms[termName];
        if (!term) {
            return;
        }
        var widgets = me.ui.node.bind(widget.var.popup, term, {
            term: ".text",
            phase: ".phase|.phase.minor",
            hebrew: ".item.hebrew",
            translation: ".item.translation",
            explanation: ".item.explanation",
            category: ".category",
            source: ".source",
            description: ".item.style.descriptions.long|"
        }, "None");
        for (var name in widgets) {
            var child = widgets[name];
            if (child) {
                child.parentNode.style.display = child.innerText === "None" ? "none" : "";
            }
        }
        var phase = widgets.phase.innerText.toLowerCase();
        var classes = "title widget-transform-level ";
        if (phase !== "root") {
            classes += "kab-term-phase-" + phase;
        }
        me.core.property.set(widgets.phase, "ui.class.class", classes);
        me.update(widget, term);
        me.core.property.set(widget.var.popup, "ui.class.add", "show");
    };
    me.update = async function (widget, term) {
        var counter = ++me.counter;
        let field = me.ui.node.findByName(widget.var.popup, "definition");
        me.core.property.set(field, "ui.basic.html", "");
        var definition = await me.lib.dictionary.definition(term.text);
        var text = "";
        if (definition) {
            if (definition.google) {
                definition.google.map(item => {
                    for (let type in item.meaning) {
                        text += "<br><b>" + type + ":</b> " + item.meaning[type].map(item => item.definition).join("<br><br>") + "<br>";
                    }
                });
            }
        }
        term.definition = text;
        if (counter !== me.counter) {
            return;
        }
        me.core.property.set(field, "ui.basic.html", text);
    };
    me.close = function (object) {
        var modal = me.ui.node.classParent(object, "modal");
        if (modal) {
            me.core.property.set(modal, "ui.class.remove", "show");
        }
    };
    me.click = function (object) {
        var element = object.nextElementSibling;
        var name = me.core.property.get(element, "ui.attribute.name");
        if (name === "hebrew") {
            me.close(object);
            me.core.app.launch("letters", [element.textContent], "");
        }
    };
};

screens.widget.transform.player = function WidgetTransformPlayer(me) {
    me.changeVoice = function (object) {
        var widget = me.upper.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = me.media.voice.isPlaying(currentPage);
        var isPaused = me.media.voice.isPaused(currentPage);
        var playWillEnable = widget.options.voiceEnglish !== "None" || widget.options.voiceHebrew !== "None";
        var playEnabled = me.widget.transform.layout.options(widget.var.layout).playEnabled;
        if (playWillEnable !== playEnabled && (!playEnabled || !playWillEnable)) {
            me.reflow(object);
            return;
        }
        if (isPlaying && !isPaused) {
            me.play(object, me.media.voice.currentIndex, false);
        }
    };
    me.updatePlayback = function (object) {
        var widget = me.upper.findWidget(object);
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
    me.setPlayState = function (object, isPaused) {
        var widget = me.upper.findWidget(object);
        var widgets = me.ui.node.childList(widget.var.iconbar);
        me.core.property.set(widgets, "ui.class.play", me.media.voice.isPlaying());
        me.core.property.set(widgets, "ui.class.pause", isPaused);
    };
    me.pause = function (object) {
        if (!me.media.voice.isPlaying()) {
            return;
        }
        me.focusParagraph(object, null);
        me.setPlayState(object, true);
        me.media.voice.pause();
    };
    me.play = function (object, value, toggle = true) {
        var widget = me.upper.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying();
        var isPaused = me.media.voice.isPaused();
        if (toggle && isPlaying && isPaused) {
            me.media.voice.resume();
            var focusElement = me.widget.transform.layout.focusElement(me.currentPlayingPage);
            me.focusParagraph(object, focusElement);
            me.setPlayState(object, false);
        }
        else {
            var index = 0;
            if (typeof value === "number") {
                index = value;
            }
            var text = me.widget.transform.layout.pageText(currentPage);
            var params = {
                index: index,
                onstate: () => {
                    me.setPlayState(widget);
                },
                onstart: () => {
                    me.log("onstart");
                    me.focusParagraph(object, null);
                },
                oncancel: () => {
                    me.log("oncancel");
                    me.widget.transform.layout.clearPage(currentPage);
                    me.focusParagraph(object, null);
                },
                onend: () => {
                    me.log("onend");
                    me.widget.transform.layout.clearPage(currentPage);
                    me.focusParagraph(object, null);
                    if (widget.options.autoPlay) {
                        if (widget.options.singleArticle && currentPage.var.separator.style.display === "block") {
                            return;
                        }
                        if (!currentPage.last) {
                            setTimeout(() => {
                                me.core.property.set(widget.var.layout, "ui.scroll.nextPage");
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
                        me.core.property.set(widget.var.layout, "ui.scroll.previousPage");
                        me.core.property.set(object, "widget.transform.player.play", -1);
                    }
                    else {
                        me.media.voice.replay();
                    }
                },
                onnext: () => {
                    me.widget.transform.layout.clearPage(currentPage);
                    if (currentPage.last) {
                        me.focusParagraph(object, null);
                        me.currentPlayingPage = null;
                    }
                    else {
                        me.core.property.set(widget.var.layout, "ui.scroll.nextPage");
                        me.core.property.set(object, "widget.transform.player.play");
                    }
                },
                onchange: (index, text) => {
                    me.log("onchange: " + index + " text:" + text);
                    me.widget.transform.layout.markPage(currentPage, index, text);
                    var focusElement = me.widget.transform.layout.focusElement(currentPage);
                    me.focusParagraph(object, focusElement);
                },
                speed: widget.options.speed,
                volume: widget.options.volume,
                language: widget.language,
                voices: {
                    english: widget.options.voiceEnglish,
                    hebrew: widget.options.voiceHebrew,
                }
            };
            me.media.voice.play(text, params);
            if (me.currentPlayingPage && me.currentPlayingPage !== currentPage) {
                me.currentPlayingPage = null;
            }
            me.currentPlayingPage = currentPage;
        }
    };
    me.stop = function (object) {
        var widget = me.upper.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.stop();
            me.widget.transform.layout.clearPage(currentPage);
            me.focusParagraph(object, null);
            me.currentPlayingPage = null;
        }
    };
    me.rewind = function (object) {
        var widget = me.upper.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.rewind();
        }
    };
    me.fastforward = function (object) {
        var widget = me.upper.findWidget(object);
        var currentPage = me.widget.transform.layout.currentPage(widget.var.layout);
        var isPlaying = me.media.voice.isPlaying(currentPage);
        if (isPlaying) {
            me.media.voice.fastforward();
        }
    };
    me.voices = function () {
        var languages = ["english", "hebrew"];
        var menu = languages.map(language => {
            let title = me.core.string.title(language);
            let voiceList = me.media.voice.voices(language);
            voiceList = voiceList.sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
            voiceList.unshift({ name: "None" });
            voiceList = voiceList.map((voice) => {
                return {
                    text: voice.name,
                    select: "widget.transform.voice" + title,
                    options: {
                        "state": "select"
                    },
                    properties: {
                        "group": "voices"
                    }
                };
            });
            let properties = {
                "text": title,
                "select": voiceList
            };
            return properties;
        });
        return menu;
    };
    me.speeds = function () {
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
    me.volumes = function () {
        var volumeList = Object.keys(me.media.voice.volumes);
        volumeList = volumeList.map(name => {
            var item = [
                name,
                "widget.transform.volume",
                {
                    "state": "select"
                },
                {
                    "group": "volumes"
                }
            ];
            return item;
        });
        return volumeList;
    };
    me.focusParagraph = function (object, paragraph) {
        var widget = me.upper.findWidget(object);
        if (!widget) {
            return;
        }
        widget.playingPopupParagraph = paragraph;
    };
};

screens.widget.transform.layout = function WidgetTransformLayout(me) {
    me.move = function (source, target) {
        do {
            var widget = source.firstElementChild;
            if (widget) {
                target.appendChild(widget);
            }
        } while (widget);
    };
    me.clear = function (target) {
        do {
            var widget = target.firstElementChild;
            if (widget) {
                target.removeChild(widget);
            }
        } while (widget);
    };
    me.prepare = function (source, target) {
        do {
            var widget = target.firstElementChild;
            if (widget) {
                if (widget.var && widget.var.content) {
                    var content = widget.var.content;
                    do {
                        var childWidget = content.firstElementChild;
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
        var page = target.firstElementChild;
        return page;
    };
    me.firstVisiblePage = function (target) {
        var page = null;
        var widget = target.firstElementChild;
        while (widget) {
            if (widget.offsetTop >= target.scrollTop) {
                page = widget;
                break;
            }
            widget = widget.nextElementSibling;
        }
        return page;
    };
    me.firstWidget = function (target) {
        var page = me.firstPage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div") {
                return page.var.content.firstElementChild;
            }
        }
        return page;
    };
    me.firstVisibleWidget = function (target) {
        var page = me.firstVisiblePage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div" && page.var && page.var.content) {
                return page.var.content.firstElementChild;
            }
        }
        return page;
    };
    me.options = function (target) {
        return target.options;
    };
    me.reflow = function (source, target, options) {
        return new Promise(resolve => {
            var modifiers = me.upper.modifiers(target);
            var layoutContent = target;
            layoutContent.options = options;
            if (target.reflowInterval) {
                clearInterval(target.reflowInterval);
                target.reflowInterval = null;
                me.move(source, me.page ? me.page.var.content : layoutContent);
                if (!target.notified) {
                    resolve();
                }
            }
            target.page = null;
            me.prepare(source, layoutContent);
            var pageSize = me.pageSize(layoutContent);
            if (!source.firstElementChild) {
                resolve(true);
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
                var window = me.widget.window.get(target);
                for (; ;) {
                    var concealed = me.core.property.get(window, "conceal");
                    var widget = source.firstElementChild;
                    if (!widget || concealed) {
                        clearInterval(target.reflowInterval);
                        target.reflowInterval = null;
                        if (options.usePages) {
                            me.applyNumPages(layoutContent, pageIndex);
                        }
                        me.completePage(target.page);
                        if (target.page) {
                            target.page.last = true;
                            target.page.var.separator.style.display = "block";
                            me.core.property.set(target.page.var.separator, "ui.class.add", "last");
                        }
                        me.completeReflow(resolve, target, options, false);
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
                            me.completeReflow(resolve, target, options);
                        }
                        break;
                    }
                    var newPage = false;
                    if (widget) {
                        me.cleanupWidget(widget);
                        me.clearWidget(widget, modifiers);
                    }
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
                    } else if (!(widget.textContent || widget.firstElementChild)) {
                        pageContent.removeChild(widget);
                        widget = null;
                        newPage = false;
                    }
                    if (newPage) {
                        if (widget) {
                            pageContent.removeChild(widget);
                        }
                        pageIndex++;
                        me.completePage(target.page);
                        target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
                        pageContent = target.page.var.content;
                        if (previousWidget && previousWidget.tagName && previousWidget.tagName.toLowerCase().match(/h\d/)) {
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
                            me.completeReflow(resolve, target, options);
                        }
                        me.core.property.set(target, "update");
                        break;
                    } else if (widget) {
                        previousWidget = widget;
                        me.activateOnLoad(target.page ? target.page : widget, widget);
                    }
                }
            }, 0);
        });
    };
    me.widgetFitInPage = function (widget, page) {
        var pageContent = page.var.content;
        var pageContainer = page.var.container;
        var result = true;
        var fitInPage = me.ui.scroll.isScrollable(page);
        var fitInContainer = me.ui.scroll.isScrollable(pageContainer);
        var fitInContent = me.ui.scroll.isScrollable(pageContent);
        result = fitInPage && fitInContainer && fitInContent;
        return result;
    };
    me.completeReflow = function (callback, target, options, scrollToWidget = true) {
        if (!target.notified && callback) {
            callback(true);
            target.notified = true;
            if (options.scrollWidget && scrollToWidget) {
                me.ui.scroll.toWidget(options.scrollWidget, target);
            }
            me.core.property.set(target, "update");
        }
    };
    me.widgetByOrder = function (page, order) {
        var widget = page.firstElementChild;
        var match = null;
        while (widget) {
            if (widget.style && widget.style.order) {
                if (parseInt(widget.style.order) > parseInt(order)) {
                    match = widget;
                    break;
                }
            }
            widget = widget.nextElementSibling;
        }
        return match;
    };
    me.createPage = function (target, pageWidth, pageHeight, pageIndex, options) {
        var modifiers = me.upper.modifiers(target);
        var page = me.ui.element.create({
            "ui.basic.tag": "div",
            "ui.class.class": ["widget.transform.page", modifiers],
            "ui.style.width": pageWidth + "px",
            "ui.style.height": pageHeight + "px",
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
        var page = me.ui.element.create({
            "ui.basic.tag": "br"
        }, target);
        return page;
    };
    me.previousPage = {
        set: function (object) {
            var widget = me.upper.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.previousPage");
        }
    };
    me.nextPage = {
        set: function (object) {
            var widget = me.upper.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.nextPage");
        }
    };
    me.scrollToTop = {
        set: function (object) {
            var widget = me.upper.findWidget(object);
            me.core.property.set(widget.var.layout, "ui.scroll.to", 0);
        }
    };
    me.applyNumPages = function (target, numPages) {
        var widget = target.firstElementChild;
        while (widget) {
            if (widget.var && widget.var.pageNumber) {
                var pageNumber = me.core.property.get(widget, "ui.attribute.pageNumber");
                me.core.property.set(widget.var.pageNumber, "ui.attribute.longPageNumberText", pageNumber + "/" + numPages);
            }
            widget = widget.nextElementSibling;
        }
    };
    me.completePage = function (page) {
        var showPage = true;
        if (!page) {
            return;
        }
        var pageNumber = me.core.property.get(page, "ui.attribute.pageNumber");
        if (pageNumber === "1" || showPage) {
            page.style.display = "";
            page.pageOffset = page.offsetTop;
            page.pageSize = page.clientHeight;
        } else {
            page.style.display = "none";
        }
        me.clearPage(page);
    };
    me.pageInView = function (page, partial = true) {
        let parentTop = parseInt(page.parentNode.scrollTop);
        let parentBottom = parseInt(parentTop + page.parentNode.clientHeight);
        let childTop = parseInt(page.pageOffset);
        let childBottom = parseInt(childTop + page.pageSize);
        let isTotal = (childTop >= parentTop && childBottom <= parentBottom);
        let isPartial = partial && ((childBottom > parentTop) ||
            (childTop < parentBottom));
        return (isTotal || isPartial);
    };
    me.pageApply = function (target, callback) {
        var child = target.firstElementChild;
        while (child) {
            if (child.pageSize) {
                callback(child);
            }
            child = child.nextElementSibling;
        }
    };
    me.updatePages = function (target) {
        var child = target.firstElementChild;
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
            child = child.nextElementSibling;
        }
    };
    me.activateOnLoad = function (parent, widget) {
        if (!widget) {
            return;
        }
        var child = widget.firstElementChild;
        while (child) {
            me.activateOnLoad(parent, child);
            child = child.nextElementSibling;
        }
        if (widget && widget.getAttribute) {
            var onload = widget.getAttribute("onload");
            if (onload) {
                me.core.property.set(parent, onload);
            }
        }
    };
    me.cleanupWidget = function (widget) {
        var child = widget.firstElementChild;
        while (child) {
            if (child.tagName && child.tagName.toLowerCase() === "div") {
                widget.removeChild(child);
                child = widget.firstElementChild;
            }
            if (child) {
                child = child.nextElementSibling;
            }
        }
        if (widget.style) {
            widget.style.border = "1px solid transparent";
            var language = me.core.string.language(widget.innerText);
            me.core.property.set(widget, "ui.class.hebrew", language === "hebrew");
        }
    };
    me.currentPage = function (target) {
        var child = target.firstElementChild;
        while (child) {
            if (child.pageSize) {
                var pageInView = me.pageInView(child, false);
                if (pageInView) {
                    return child;
                }
            }
            child = child.nextElementSibling;
        }
        return null;
    };
    me.pageText = function (page, filterCallback, modifyCallback) {
        var content = page.var.content;
        var array = Array.from(content.children).map(el => {
            if (el.getAttribute("hidden")) {
                return "";
            }
            if (filterCallback && !filterCallback(el)) {
                return "";
            }
            var text = el.innerText;
            if (!text) {
                text = "";
            }
            text = text.trim();
            if (modifyCallback) {
                text = modifyCallback(el, text);
            }
            return text;
        });
        return array;
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
            element.style.opacity = "0.75";
        }
    };
    me.clearWidget = function (widget, modifiers) {
        if (!widget.getAttribute) {
            return;
        }
        if (widget.getAttribute("hidden")) {
            return;
        }
        me.markElement(widget, true);
        if (widget.innerText) {
            me.core.property.set(widget, "ui.class.add", ["widget.transform.widget", modifiers]);
        }
        widget.classList.remove("mark");
    };
    me.clearPage = function (page) {
        var content = page.var.content;
        var modifiers = me.upper.modifiers(page);
        Array.from(content.children).map(element => {
            me.clearWidget(element, modifiers);
        });
        page.focusElement = null;
    };
    me.markPage = function (page, index) {
        var content = page.var.content;
        var focusElement = null;
        focusElement = content.children[index];
        Array.from(content.children).map(element => {
            if (element.getAttribute("hidden")) {
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
