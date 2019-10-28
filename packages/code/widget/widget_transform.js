/*
 @author Zakai Hamilton
 @component WidgetTransform
 */

screens.widget.transform = function WidgetTransform(me, { core, ui, media, widget, kab }) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
    };
    me.initOptions = function (object) {
        var transformWidget = me.findWidget(object);
        transformWidget.language = null;
        ui.options.load(me, transformWidget, {
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
            exportSource: false,
            highlightReading: true,
            showParagraphIndex: true
        });
        transformWidget.pageSize = { width: 0, height: 0 };
        transformWidget.filterText = "";
        ui.options.toggleSet(me, me.findWidget, {
            doTranslation: me.transform,
            doExplanation: me.transform,
            prioritizeExplanation: me.transform,
            addStyles: me.transform,
            phaseNumbers: me.transform,
            keepSource: me.transform,
            abridged: me.transform,
            pages: me.reflow,
            snap: (object) => {
                var transformWidget = me.findWidget(object);
                core.property.set(transformWidget.var.layout, {
                    "ui.scroll.snap": transformWidget.options.snap,
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
            exportSource: null,
            highlightReading: null,
            showParagraphIndex: me.reflow
        });
        ui.options.choiceSet(me, me.findWidget, {
            language: me.transform,
            fontSize: (object, value) => {
                var transformWidget = me.findWidget(object);
                core.property.set([transformWidget.var.layout], "ui.style.fontSize", value);
                transformWidget.forceReflow = true;
                core.property.notify(transformWidget, "update");
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
        var transformWidget = ui.node.container(object, me.id);
        if (!transformWidget) {
            var window = widget.window.get(object);
            if (window) {
                transformWidget = window.var.transform;
                if (!transformWidget) {
                    transformWidget = window;
                }
            }
        }
        return transformWidget;
    };
    me.text = {
        get: function (object) {
            var transformWidget = me.findWidget(object);
            return transformWidget.transformText;
        },
        set: function (object, value) {
            var transformWidget = me.findWidget(object);
            transformWidget.transformText = value;
        }
    };
    me.transform = async function (object) {
        var transformWidget = me.findWidget(object);
        widget.transform.layout.clear(transformWidget.var.layout);
        var text = transformWidget.transformText;
        transformWidget.contentTitle = "";
        me.updateWidgets(transformWidget, text, false);
        transformWidget.inTransform = true;
        core.property.set(transformWidget.var.spinner, "text", "Transform");
        core.property.set(transformWidget, "ui.work.state", true);
        var language = transformWidget.options.language.toLowerCase();
        if (language === "auto") {
            if (text && text.startsWith("<")) {
                language = "none";
            }
            else {
                language = core.string.language(text);
            }
            me.log("detected language: " + language);
        }
        transformWidget.options.clickCallback = "screens.widget.transform.popup.open";
        transformWidget.options.reload = true;
        media.voice.stop();
        var options = Object.assign({}, transformWidget.options, { nightMode: ui.theme.options.nightMode });
        var info = { text, terms: {}, data: null };
        if (language !== "none") {
            info = await kab.text.parse(language, text, options);
        }
        if (!info) {
            info = { text: "", terms: {}, data: null };
        }
        text = info.text;
        var terms = info.terms;
        var data = info.data;
        var diagrams = info.diagrams;
        if (transformWidget.language) {
            core.property.set(transformWidget.var.layout, "ui.class.remove", transformWidget.language);
        }
        core.property.set(transformWidget.var.layout, "ui.class.add", language);
        transformWidget.language = language;
        core.property.set(transformWidget.var.output, "ui.basic.html", text);
        if (text) {
            transformWidget.termData = { terms, data, diagrams };
        }
        else {
            transformWidget.termData = {};
        }
        core.property.set(transformWidget.var.output, "ui.style.display", "none");
        core.property.set(transformWidget.var.layout, "ui.style.display", text ? "" : "none");
        widget.transform.layout.move(transformWidget.var.output, transformWidget.var.layout);
        transformWidget.forceReflow = true;
        transformWidget.contentChanged = true;
        transformWidget.inTransform = false;
        await core.property.set(transformWidget, "update");
        core.property.set(transformWidget, "ui.work.state", false);
    };
    me.reflow = function (object) {
        var transformWidget = me.findWidget(object);
        transformWidget.forceReflow = true;
        core.property.notify(transformWidget, "update");
    };
    me.work = function (object, value) {
        var transformWidget = me.findWidget(object);
        if (transformWidget.workTimeout) {
            clearTimeout(transformWidget.workTimeout);
            transformWidget.workTimeout = null;
        }
        var text = core.property.get(transformWidget, "text");
        if (value && text) {
            core.property.set([transformWidget.var.layout, transformWidget.var.iconbar], "ui.style.opacity", 0);
            core.property.set(transformWidget.var.spinner, "ui.style.visibility", "visible");
        } else {
            transformWidget.workTimeout = setTimeout(function () {
                core.property.set(transformWidget.var.spinner, "ui.style.visibility", "hidden");
                core.property.set([transformWidget.var.layout, transformWidget.var.iconbar], "ui.style.opacity", "");
                me.updateScrolling(transformWidget);
            }, 250);
        }
    };
    me.shouldReflow = function (object) {
        var transformWidget = me.findWidget(object);
        var reflow = false;
        var pageSize = widget.transform.layout.pageSize(transformWidget.var.layout);
        var window = widget.window.get(object);
        var fullscreen = core.property.get(window, "fullscreen");
        if (core.property.get(window, "visible") && !core.property.get(window, "conceal")) {
            if (transformWidget.pageSize && (pageSize.height !== transformWidget.pageSize.height || pageSize.width !== transformWidget.pageSize.width)) {
                reflow = true;
            }
            if (transformWidget.fullscreen !== fullscreen) {
                reflow = true;
            }
            if (transformWidget.forceReflow) {
                reflow = true;
            }
        }
        return reflow;
    };
    me.modifiers = function (object) {
        var transformWidget = me.findWidget(object);
        if (!transformWidget) {
            return [];
        }
        var modifiers = [transformWidget.language];
        if (transformWidget.options.pipVideo) {
            modifiers.push("pipVideo");
        }
        if (core.property.get(transformWidget, "fullscreen")) {
            modifiers.push("fullscreen");
        }
        modifiers = modifiers.map((modifier) => {
            return "." + modifier;
        });
        return modifiers;
    };
    me.update = async function (object) {
        var transformWidget = me.findWidget(object);
        if (transformWidget.inTransform) {
            return;
        }
        if (!me.shouldReflow(object)) {
            return;
        }
        if (!transformWidget.options) {
            return;
        }
        var visibleWidget = null;
        if (!transformWidget.contentChanged) {
            visibleWidget = widget.transform.layout.firstVisibleWidget(transformWidget.var.layout);
        }
        transformWidget.forceReflow = false;
        transformWidget.contentChanged = false;
        transformWidget.pageSize = widget.transform.layout.pageSize(transformWidget.var.layout);
        core.property.set(transformWidget.var.spinner, "text", "Layout");
        var window = widget.window.get(object);
        var fullscreen = core.property.get(window, "fullscreen");
        transformWidget.fullscreen = fullscreen;
        core.property.set(transformWidget, "ui.work.state", true);
        transformWidget.var.layout.style.opacity = 0;
        if (transformWidget.options.pages) {
            transformWidget.var.layout.style.margin = "";
        } else {
            transformWidget.var.layout.style.margin = "20px 40px";
        }
        var columnCount = transformWidget.options.columns ? 2 : 1;
        var reflowOptions = {
            usePages: transformWidget.options.pages,
            columnCount: columnCount,
            columnWidth: "400px",
            scrollWidget: visibleWidget,
            scrollPos: transformWidget.options.scrollPos,
            playEnabled: transformWidget.options.voiceEnglish !== "None" || transformWidget.options.voiceHebrew !== "None",
            language: transformWidget.options.language,
            showParagraphIndex: transformWidget.options.showParagraphIndex
        };
        media.voice.stop();
        await widget.transform.layout.reflow(transformWidget.var.output, transformWidget.var.layout, reflowOptions);
        core.property.set(transformWidget, "ui.work.state", false);
        var name = core.property.get(transformWidget, "widget.transform.name");
        core.property.set(transformWidget, "widget.window.name", name);
    };
    me.scrolled = {
        set: function (object, value) {
            var transformWidget = me.findWidget(object);
            if (core.property.get(transformWidget, "ui.work.state") || core.property.get(transformWidget, "conceal")) {
                return;
            }
            widget.transform.layout.updatePages(transformWidget.var.layout);
            if (transformWidget.scrolledTimer) {
                clearTimeout(transformWidget.scrolledTimer);
            }
            transformWidget.scrolledTimer = setTimeout(function () {
                if (core.property.get(transformWidget, "ui.work.state") || core.property.get(transformWidget, "conceal")) {
                    return;
                }
                if (value && "vertical" in value) {
                    core.property.set(transformWidget, "widget.transform.scrollPos", value.vertical);
                }
            }, 2000);
            core.property.set([transformWidget.var.scrollToTop, transformWidget.var.previousPage], "ui.class.disabled", !transformWidget.var.layout.scrollTop);
            core.property.set([transformWidget.var.scrollToBottom, transformWidget.var.nextPage], "ui.class.disabled", ui.scroll.isLastPage(transformWidget.var.layout));
        }
    };
    me.diagramList = {
        get: function (object) {
            var transformWidget = me.findWidget(object);
            var diagrams = transformWidget.termData.diagrams;
            if (!diagrams) {
                diagrams = [];
            }
            diagrams = diagrams.map(name => {
                return { title: core.string.title(name), name };
            });
            if (transformWidget.termData.diagrams && (!diagrams[0] || diagrams[0].title !== "Table of Phases")) {
                diagrams.unshift({ title: "Table of Phases", name: "table_of_phases", params: me.tableOfPhasesParams(transformWidget) });
            }
            var items = diagrams.map(function (item) {
                var result = {
                    text: item.title,
                    select: function () {
                        core.app.launch("diagram", item.name, transformWidget.options, null, item.params);
                    },
                    options: {
                        enabled: transformWidget.transformText !== null
                    }
                };
                return result;
            });
            items = items.filter(Boolean);
            return items;
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
        var transformWidget = me.findWidget(object);
        core.property.set([transformWidget.var.output, transformWidget.var.layout], {
            "ui.style.fontSize": transformWidget.options.fontSize
        });
        if (update) {
            core.property.notify(transformWidget, "update");
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
        var transformWidget = me.findWidget(object);
        var rows = {};
        if (!transformWidget.termData) {
            return params;
        }
        var terms = transformWidget.termData.terms;
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
        var transformWidget = me.findWidget(object);
        var pageSize = widget.transform.layout.pageSize(transformWidget.var.layout);
        core.property.set(transformWidget.var.layout, {
            "ui.scroll.pageSize": pageSize.height,
            "ui.scroll.scrollTo": transformWidget.options.scrollPos,
            "ui.scroll.scrolled": null,
            "ui.scroll.snap": transformWidget.options.snap
        });
    };
    me.clear = function (object) {
        var transformWidget = me.findWidget(object);
        transformWidget.transformText = "";
        core.property.set(transformWidget.var.output, "ui.basic.html", "");
        widget.transform.layout.clear(transformWidget.var.layout);
        me.updateWidgets(transformWidget, true);
        transformWidget.options.scrollPos = 0;
        core.property.set(transformWidget.var.layout, "ui.style.display", "none");
        me.transform(object);
    };
    me.contentTitle = {
        get: function (object) {
            var transformWidget = me.findWidget(object);
            var title = widget.transform.layout.firstWidget(transformWidget.var.layout);
            if (title && title.tagName && title.tagName.toLowerCase() === "h4") {
                title = title.innerText;
                transformWidget.contentTitle = title;
                return title;
            }
            else {
                title = transformWidget.contentTitle;
            }
            return title;
        }
    };
    me.name = {
        get: function (object) {
            var transformWidget = me.findWidget(object);
            var window = widget.window.get(transformWidget);
            var title = core.property.get(transformWidget, "widget.transform.contentTitle");
            var key = core.property.get(window, "widget.window.key");
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
        return widget.menu.collect(object, info);
    };
    me.transformedText = function (object, useFilter, useSource) {
        var transformWidget = me.findWidget(object);
        var list = [];
        var previousIndex = 0;
        var sequence = false;
        widget.transform.layout.pageApply(transformWidget.var.layout, (page) => {
            var modify = (element, text) => {
                let use = true;
                if (useFilter && !core.property.get(element, "ui.class.kab-term-highlight")) {
                    use = false;
                }
                let index = parseInt(core.property.get(element, "ui.attribute.#index"));
                if (useSource) {
                    text = core.property.get(element, "ui.attribute.#source");
                }
                else {
                    text = text.split("\n").join("");
                }
                const isHeader = element.tagName && element.tagName.toLowerCase() === "h4";
                if (text) {
                    if (isHeader) {
                        text = "\n" + text;
                    }
                    else if (previousIndex === index - 1 || text.match(/^\d+\)/)) {
                        text = "\n\n" + text;
                        sequence = true;
                    }
                    else if (useFilter) {
                        text = "\n\n... " + text;
                    }
                }
                if (use && !isHeader) {
                    previousIndex = index;
                }
                if (!use) {
                    if (sequence) {
                        sequence = false;
                    }
                    text = "";
                }
                return text;
            };
            var paragraphs = widget.transform.layout.pageText(page, modify);
            paragraphs = paragraphs.filter(Boolean);
            if (paragraphs && paragraphs.length) {
                list.push(paragraphs.join(""));
            }
        });
        let text = list.join("").trim();
        if (text && !sequence && useFilter) {
            text += " ...";
        }
        return text;
    };
    me.exportText = function (object, target) {
        var transformWidget = me.findWidget(object);
        var text = "";
        if (transformWidget.options.showHighlights && transformWidget.options.copyHighlights) {
            text = me.transformedText(object, true, transformWidget.options.exportSource);
        }
        if (!text) {
            text = me.transformedText(object, false);
        }
        core.property.set(target, "importData", text);
    };
    me.visualize = function (object) {
        var transformWidget = me.findWidget(object);
        var window = widget.window.get(transformWidget);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        var terms = [];
        ui.node.iterate(currentPage, (element) => {
            var term = core.property.get(element, "ui.attribute.kab-term");
            if (term) {
                terms.push(term);
            }
        });
        terms = Array.from(new Set(terms));
        terms = terms.map(term => {
            return [term];
        });
        var fullscreen = core.property.get(window, "fullscreen");
        var params = {
            terms,
            fullscreen
        };
        core.app.launch("visualize", params);
    };
    me.removeHighlights = function (object) {
        var transformWidget = me.findWidget(object);
        ui.node.iterate(transformWidget.var.layout, (element) => {
            kab.highlight.remove(element);
        });
    };
    me.filter = {
        get: function (object) {
            var transformWidget = me.findWidget(object);
            return transformWidget.filterText;
        },
        set: function (object, text) {
            var transformWidget = me.findWidget(object);
            if (transformWidget && transformWidget.filterText !== text) {
                transformWidget.filterText = text;
                me.reflow(transformWidget);
            }
        }
    };
};

screens.widget.transform.popup = function WidgetTransformPopup(me, { core, ui }) {
    me.init = function () {
        me.definitionCounter = 0;
        me.associatedCounter = 0;
    };
    me.open = async function (object, termName) {
        var transformWidget = me.upper.findWidget(object);
        var foundTermName = Object.keys(transformWidget.termData.terms).find((term) => {
            return term.replace(/\s+/g, "") === termName.replace(/\s+/g, "");
        });
        if (foundTermName && termName !== foundTermName) {
            termName = foundTermName;
        }
        var term = transformWidget.termData.terms[termName];
        if (!term) {
            return;
        }
        var widgets = ui.node.bind(transformWidget.var.popup, term, {
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
        core.property.set(widgets.phase, "ui.class.class", classes);
        me.updateDefinition(transformWidget, term);
        me.updateAssociated(transformWidget, term);
        setTimeout(() => {
            core.property.set(transformWidget.var.popup, "ui.class.add", "show");
        }, 250);
        core.property.set(transformWidget.var.popup, "ui.class.remove", "show");
    };
    me.updateDefinition = async function (widget, term) {
        var counter = ++me.definitionCounter;
        let field = ui.node.findByName(widget.var.popup, "definition");
        core.property.set(field, "ui.basic.html", "");
        var definition = await me.lib.dictionary.definition(term.text);
        var text = "";
        if (definition) {
            if (definition.google) {
                if (!Array.isArray(definition.google)) {
                    definition.google = [definition.google];
                }
                definition.google.map(item => {
                    for (let type in item.meaning) {
                        text += "<br><b>" + type + ":</b> " + item.meaning[type].map(item => item.definition).join("<br><br>") + "<br>";
                    }
                });
            }
        }
        term.definition = text;
        if (counter !== me.definitionCounter) {
            return;
        }
        core.property.set(field, "ui.basic.html", text);
    };
    me.updateAssociated = async function (widget, term) {
        var counter = ++me.associatedCounter;
        let field = ui.node.findByName(widget.var.popup, "associated");
        core.property.set(field, "ui.basic.html", "");
        let associated = term.item.associated;
        if (associated) {
            let text = "";
            for (let type in associated) {
                let set = associated[type];
                let options = Object.assign({}, widget.options);
                options.showHighlights = false;
                options.commentaryEdit = false;
                var info = await kab.text.parse(widget.language, set.join(" "), options);
                if (counter !== me.associatedCounter) {
                    return;
                }
                core.property.set(field, "ui.style.fontSize", widget.options.fontSize);
                if (info.text) {
                    text += "<b>" + type + ":</b></br>" + info.text;
                }
            }
            core.property.set(field, "ui.basic.html", text);
        }
    };
    me.close = function (object) {
        var modal = ui.node.classParent(object, "modal");
        if (modal) {
            core.property.set(modal, "ui.class.remove", "show");
        }
    };
    me.click = function (object) {
        var element = object.nextElementSibling;
        var name = core.property.get(element, "ui.attribute.name");
        if (name === "hebrew") {
            me.close(object);
            core.app.launch("letters", [element.textContent], "");
        }
    };
};

screens.widget.transform.player = function WidgetTransformPlayer(me, { core, ui, media, widget }) {
    me.changeVoice = function (object) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = media.voice.isPlaying(currentPage);
        var isPaused = media.voice.isPaused(currentPage);
        var playWillEnable = transformWidget.options.voiceEnglish !== "None" || transformWidget.options.voiceHebrew !== "None";
        var playEnabled = widget.transform.layout.options(transformWidget.var.layout).playEnabled;
        if (playWillEnable !== playEnabled && (!playEnabled || !playWillEnable)) {
            me.reflow(object);
            return;
        }
        if (isPlaying && !isPaused) {
            me.play(object, media.voice.currentIndex, false);
        }
    };
    me.updatePlayback = function (object) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        if (!currentPage) {
            return;
        }
        var isPlaying = media.voice.isPlaying(currentPage);
        var isPaused = media.voice.isPaused(currentPage);
        if (isPlaying && !isPaused) {
            me.play(object, media.voice.currentIndex, false);
        }
    };
    me.setPlayState = function (object, isPaused) {
        var transformWidget = me.upper.findWidget(object);
        var widgets = ui.node.childList(transformWidget.var.iconbar);
        core.property.set(widgets, "ui.class.play", media.voice.isPlaying());
        core.property.set(widgets, "ui.class.pause", isPaused);
    };
    me.pause = function (object) {
        if (!media.voice.isPlaying()) {
            return;
        }
        me.focusParagraph(object, null);
        me.setPlayState(object, true);
        media.voice.pause();
    };
    me.play = function (object, value, toggle = true) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        var isPaused = media.voice.isPaused();
        if (toggle && isPaused) {
            media.voice.resume();
            var focusElement = widget.transform.layout.focusElement(me.currentPlayingPage);
            me.focusParagraph(object, focusElement);
            me.setPlayState(object, false);
        }
        else {
            var index = 0;
            if (typeof value === "number") {
                index = value;
            }
            var paragraphs = widget.transform.layout.pageText(currentPage, (el, text) => {
                return text.split("\n").join(" ");
            });
            var params = {
                index: index,
                onstate: () => {
                    me.setPlayState(transformWidget);
                },
                onstart: () => {
                    me.log("onstart");
                    me.focusParagraph(object, null);
                },
                oncancel: () => {
                    me.log("oncancel");
                    widget.transform.layout.clearPage(currentPage);
                    me.focusParagraph(object, null);
                },
                onend: () => {
                    me.log("onend");
                    widget.transform.layout.clearPage(currentPage);
                    me.focusParagraph(object, null);
                    if (transformWidget.options.autoPlay) {
                        if (transformWidget.options.singleArticle && currentPage.var.separator.style.display === "block") {
                            return;
                        }
                        if (!currentPage.last) {
                            setTimeout(() => {
                                core.property.set(transformWidget.var.layout, "ui.scroll.nextPage");
                                setTimeout(() => {
                                    core.property.set(object, "widget.transform.player.play");
                                }, 1000);
                            }, 1000);
                        }
                    }
                },
                onprevious: () => {
                    var pageNumber = core.property.get(currentPage, "ui.attribute.pageNumber");
                    if (pageNumber > 1) {
                        widget.transform.layout.clearPage(currentPage);
                        me.focusParagraph(object, null);
                        core.property.set(transformWidget.var.layout, "ui.scroll.previousPage");
                        core.property.set(object, "widget.transform.player.play", -1);
                    }
                    else {
                        media.voice.replay();
                    }
                },
                onnext: () => {
                    widget.transform.layout.clearPage(currentPage);
                    if (currentPage.last) {
                        me.focusParagraph(object, null);
                        me.currentPlayingPage = null;
                    }
                    else {
                        core.property.set(transformWidget.var.layout, "ui.scroll.nextPage");
                        core.property.set(object, "widget.transform.player.play");
                    }
                },
                onchange: (widgetIndex, textIndex, text) => {
                    me.log("onchange: " + widgetIndex + "-" + textIndex + " text:" + text);
                    widget.transform.layout.markPage(currentPage, widgetIndex, textIndex);
                    var focusElement = widget.transform.layout.focusElement(currentPage);
                    me.focusParagraph(object, focusElement);
                },
                speed: transformWidget.options.speed,
                volume: transformWidget.options.volume,
                language: transformWidget.language,
                voices: {
                    english: transformWidget.options.voiceEnglish,
                    hebrew: transformWidget.options.voiceHebrew,
                }
            };
            media.voice.play(paragraphs, params);
            if (me.currentPlayingPage && me.currentPlayingPage !== currentPage) {
                me.currentPlayingPage = null;
            }
            me.currentPlayingPage = currentPage;
        }
    };
    me.stop = function (object) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        var isPlaying = media.voice.isPlaying(currentPage);
        if (isPlaying) {
            media.voice.stop();
            widget.transform.layout.clearPage(currentPage);
            me.focusParagraph(object, null);
            me.currentPlayingPage = null;
            me.setPlayState(transformWidget);
        }
    };
    me.rewind = function (object) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        var isPlaying = media.voice.isPlaying(currentPage);
        if (isPlaying) {
            media.voice.rewind();
        }
    };
    me.fastforward = function (object) {
        var transformWidget = me.upper.findWidget(object);
        var currentPage = widget.transform.layout.currentPage(transformWidget.var.layout);
        var isPlaying = media.voice.isPlaying(currentPage);
        if (isPlaying) {
            media.voice.fastforward();
        }
    };
    me.voices = function () {
        var languages = ["english", "hebrew"];
        var menu = languages.map(language => {
            let title = core.string.title(language);
            let voiceList = media.voice.voices(language);
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
    me.speeds = function (object) {
        var list = [];
        for (var name in media.voice.speeds) {
            var speed = media.voice.speeds[name];
            list.push({ name, speed: "x" + speed });
        }
        var info = {
            list,
            property: "name",
            options: { "state": "select" },
            group: "speeds",
            itemMethod: "widget.transform.speed",
            metadata: {
                "Name": "name",
                "Speed": "speed"
            }
        };
        return widget.menu.collect(object, info);
    };
    me.volumes = function () {
        var volumeList = Object.keys(media.voice.volumes);
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
        var transformWidget = me.upper.findWidget(object);
        if (!transformWidget) {
            return;
        }
        transformWidget.playingPopupParagraph = paragraph;
    };
};

screens.widget.transform.layout = function WidgetTransformLayout(me, { core, ui, widget }) {
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
        var container = ui.node.container(target, widget.container.id);
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
            let afterBreak = true;
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
                target.page.afterBreak = afterBreak;
                afterBreak = false;
                pageContent = target.page.var.content;
            }
            var previousWidget = null, visibleWidget = null;
            var showInProgress = false;
            target.index = 1;
            target.reflowInterval = setInterval(function () {
                var window = widget.window.get(target);
                for (; ;) {
                    var concealed = core.property.get(window, "conceal");
                    var sourceWidget = source.firstElementChild;
                    if (!sourceWidget || concealed) {
                        clearInterval(target.reflowInterval);
                        target.reflowInterval = null;
                        if (options.usePages) {
                            me.applyNumPages(layoutContent, pageIndex);
                        }
                        me.completePage(target.page);
                        if (target.page) {
                            target.page.last = true;
                            target.page.var.separator.style.display = "block";
                            core.property.set(target.page.var.separator, "ui.class.add", "last");
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
                    if (options.showParagraphIndex && sourceWidget.tagName && sourceWidget.innerText && sourceWidget.tagName.toLowerCase() === "p") {
                        sourceWidget.setAttribute("index", target.index++);
                    }
                    if (sourceWidget.style && sourceWidget.style.order) {
                        location.insertBefore(sourceWidget, me.widgetByOrder(location, sourceWidget.style.order));
                    } else {
                        location.appendChild(sourceWidget);
                    }
                    visibleWidget = sourceWidget;
                    if (!target.page) {
                        if (showInProgress) {
                            me.completeReflow(resolve, target, options);
                        }
                        break;
                    }
                    var newPage = false;
                    if (sourceWidget) {
                        me.cleanupWidget(sourceWidget);
                        me.clearWidget(sourceWidget, modifiers);
                    }
                    newPage = !me.widgetFitInPage(sourceWidget, target.page);
                    if (sourceWidget.tagName && sourceWidget.tagName.toLowerCase() === "hr") {
                        previousWidget = null;
                    }
                    else if (sourceWidget.tagName && sourceWidget.tagName.toLowerCase() === "br") {
                        newPage = true;
                        sourceWidget = null;
                        previousWidget = null;
                        if (target.page) {
                            target.page.var.separator.style.display = "block";
                            afterBreak = true;
                        }
                    } else if (!(sourceWidget.textContent || sourceWidget.firstElementChild)) {
                        pageContent.removeChild(sourceWidget);
                        sourceWidget = null;
                        newPage = false;
                    }
                    if (newPage) {
                        if (sourceWidget) {
                            pageContent.removeChild(sourceWidget);
                        }
                        pageIndex++;
                        let previousPage = target.page;
                        target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
                        target.page.afterBreak = afterBreak;
                        afterBreak = false;
                        pageContent = target.page.var.content;
                        if (previousWidget && previousWidget.tagName && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                            pageContent.appendChild(previousWidget);
                        }
                        if (sourceWidget) {
                            pageContent.appendChild(sourceWidget);
                        }
                        for (var fontSize = parseInt(target.style.fontSize); fontSize >= 8; fontSize -= 2) {
                            if (me.widgetFitInPage(null, target.page)) {
                                break;
                            }
                            target.page.style.fontSize = fontSize + "px";
                            target.page.style.lineHeight = "2em";
                        }
                        previousWidget = null;
                        me.completePage(previousPage);
                        if (showInProgress) {
                            me.completeReflow(resolve, target, options);
                        }
                        core.property.set(target, "update");
                        break;
                    } else if (sourceWidget) {
                        previousWidget = sourceWidget;
                    }
                }
            }, 0);
        });
    };
    me.widgetFitInPage = function (widget, page) {
        var pageContent = page.var.content;
        var pageContainer = page.var.container;
        var result = true;
        var fitInPage = ui.scroll.isScrollable(page);
        var fitInContainer = ui.scroll.isScrollable(pageContainer);
        var fitInContent = ui.scroll.isScrollable(pageContent);
        result = fitInPage && fitInContainer && fitInContent;
        return result;
    };
    me.completeReflow = function (callback, target, options, scrollToWidget = true) {
        if (!target.notified && callback) {
            callback(true);
            target.notified = true;
            if (options.scrollWidget && scrollToWidget) {
                ui.scroll.toWidget(options.scrollWidget, target);
            }
            core.property.set(target, "update");
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
        var page = ui.element.create({
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
        var page = ui.element.create({
            "ui.basic.tag": "br"
        }, target);
        return page;
    };
    me.previousPage = {
        set: function (object) {
            var transformWidget = me.upper.findWidget(object);
            core.property.set(transformWidget.var.layout, "ui.scroll.previousPage");
        }
    };
    me.nextPage = {
        set: function (object) {
            var transformWidget = me.upper.findWidget(object);
            core.property.set(transformWidget.var.layout, "ui.scroll.nextPage");
        }
    };
    me.scrollToTop = {
        set: function (object) {
            var transformWidget = me.upper.findWidget(object);
            core.property.set(transformWidget.var.layout, "ui.scroll.firstPage");
        }
    };
    me.scrollToBottom = {
        set: function (object) {
            var transformWidget = me.upper.findWidget(object);
            core.property.set(transformWidget.var.layout, "ui.scroll.lastPage");
        }
    };
    me.applyNumPages = function (target, numPages) {
        var transformWidget = target.firstElementChild;
        while (transformWidget) {
            if (transformWidget.var && transformWidget.var.pageNumber) {
                var pageNumber = core.property.get(transformWidget, "ui.attribute.pageNumber");
                core.property.set(transformWidget.var.pageNumber, "ui.attribute.longPageNumberText", pageNumber + "/" + numPages);
            }
            transformWidget = transformWidget.nextElementSibling;
        }
    };
    me.completePage = function (page) {
        if (!page) {
            return;
        }
        var transformWidget = me.upper.findWidget(page);
        if (!transformWidget) {
            return;
        }
        let text = widget.transform.layout.pageText(page).join("\n").toLowerCase();
        let mark = transformWidget.filterText && text.includes(transformWidget.filterText.toLowerCase());
        var showPage = !transformWidget.filterText || mark;
        let content = page.var.content;
        ui.html.markElement(content, mark ? transformWidget.filterText : "");
        if (page.afterBreak || showPage) {
            if (page.afterBreak) {
                page.style.borderTop = "2px solid var(--color)";
            }
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
        let isPartial = partial && (((childTop < parentTop) && (childBottom > parentTop)) ||
            ((childTop < parentBottom) && (childBottom > parentBottom)));
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
                var pageInView = me.pageInView(child, false);
                var childInView = child.inView || false;
                if (pageInView !== childInView) {
                    if (pageInView) {
                        child.setAttribute("name", "content");

                    } else {
                        child.setAttribute("name", "");
                    }
                    child.inView = pageInView;
                }
            }
            child = child.nextElementSibling;
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
            var language = core.string.language(widget.innerText);
            core.property.set(widget, "ui.class.hebrew", language === "hebrew");
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
    me.pageText = function (page, modifyCallback) {
        var content = page.var.content;
        var array = Array.from(content.children).map(el => {
            if (el.getAttribute("hidden")) {
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
    me.markElement = function (element, mark, textIndex) {
        var childElement = null;
        if (mark) {
            if (textIndex !== -1) {
                if (textIndex >= element.children.length) {
                    textIndex = element.children.length - 1;
                }
                childElement = element.children[textIndex];
            }
            element.style.opacity = "";
        }
        else {
            element.style.opacity = "0.75";
        }
        Array.from(element.children).map(element => {
            if (element.getAttribute("hidden")) {
                return;
            }
            core.property.set(element, "ui.class.highlight", false);
        });
        core.property.set(childElement, "ui.class.highlight", true);
    };
    me.clearWidget = function (widget, modifiers) {
        if (!widget.getAttribute) {
            return;
        }
        if (widget.getAttribute("hidden")) {
            return;
        }
        me.markElement(widget, true, -1);
        if (widget.innerText) {
            core.property.set(widget, "ui.class.add", ["widget.transform.widget", modifiers]);
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
    me.markPage = function (page, widgetIndex, textIndex) {
        var transformWidget = me.upper.findWidget(page);
        var content = page.var.content;
        var focusElement = null;
        focusElement = content.children[widgetIndex];
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
                focusElement.classList.add("mark");
            }
            page.focusElement = focusElement;
        }
        if (focusElement) {
            me.markElement(focusElement, true, (transformWidget.options.highlightReading ? textIndex : -1));
        }
    };
    me.focusElement = function (page) {
        return page.focusElement;
    };
};
