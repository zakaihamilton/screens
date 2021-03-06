/*
 @author Zakai Hamilton
 @component AppGematria
 */

screens.app.letters = function AppGematria(me, { core, ui, widget }) {
    me.init = async function () {
        await ui.content.implement(me);
    };
    me.launch = async function (args) {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            core.property.set(me.singleton, "widget.window.show", true);
            if (typeof args[0] === "string") {
                me.content.import(me.singleton, args[0], args[1]);
            }
            else if (Array.isArray(args[0])) {
                me.importData(me.singleton, args[0].join("|"), args[1]);
            }
            return me.singleton;
        }
        await me.content.update();
        me.singleton = ui.element.create(me.json, "workspace", "self");
        me.initOptions(me.singleton);
        me.updateLetters(me.singleton);
        if (typeof args[0] === "string") {
            me.content.import(me.singleton, args[0], args[1]);
        }
        else if (Array.isArray(args[0])) {
            me.importData(me.singleton, args[0].join("|"));
        }
        return me.singleton;
    };
    me.initOptions = function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            fontSize: "4em",
            endingLetters: false,
            numerology: true,
            sumEnabled: true,
            inclusion: false,
            language: "English"
        });
        ui.options.toggleSet(me, null, {
            "numerology": me.updateLetters,
            "sumEnabled": me.updateLetters,
            "endingLetters": me.updateLetters,
            "inclusion": me.updateLetters
        });
        ui.options.choiceSet(me, null, {
            "fontSize": (object, value) => {
                core.property.set(window.var.diagram, "ui.style.fontSize", value);
            },
            "language": me.updateLetters
        });
        core.property.set(window.var.diagram, "ui.style.fontSize", window.options.fontSize);
    };
    me.clear = function (object) {
        var window = widget.window.get(object);
        core.property.set(window.var.input, "ui.basic.text", "");
        core.property.set(window, "name", "");
        me.updateLetters(window);
    };
    me.copyUrl = function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.input, "ui.basic.text");
        core.util.copyUrl("letters", [text]);
    };
    me.updateLetters = function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.input, "ui.basic.text");
        var sources = text.split("|").map((token, index) => {
            return {
                "verse": token,
                "offset": index
            };
        });
        var info = {
            "sources": sources,
            "sequence": true,
            "language": window.options.language,
            "sum": {
                "enabled": window.options.sumEnabled,
                "borderWidth": "3px"
            },
            "endingLetters": window.options.endingLetters,
            "inclusion": window.options.inclusion
        };
        core.property.set(window.var.diagram, "kab.letters.source", info);
        core.property.set(window.var.diagram, {
            "ui.basic.html": null,
            "core.property.group": [
                {
                    "ui.group.data": {
                        "ui.data.keyList": [
                            "ui.style.gridRow",
                            "ui.style.gridColumn",
                            "ui.basic.text",
                            "ui.style.backgroundColor",
                            "ui.style.borderColor",
                            "ui.style.borderWidth"
                        ],
                        "ui.data.default": {
                            "ui.basic.tag": "div",
                            "ui.class.class": "app.letters.letter"
                        },
                        "ui.data.values": [
                            "kab.letters.text"
                        ]
                    }
                },
                {
                    "ui.group.data": {
                        "ui.data.keyList": [
                            "ui.style.gridRow",
                            "ui.style.gridColumn",
                            "ui.basic.text"
                        ],
                        "ui.data.default": {
                            "ui.basic.tag": "div",
                            "ui.class.class": "app.letters.number",
                            "ui.basic.show": window.options.numerology
                        },
                        "ui.data.values": [
                            "kab.letters.numerology"
                        ]
                    }
                },
                {
                    "ui.group.data": {
                        "ui.data.keyList": [
                            "ui.style.gridRow",
                            "ui.style.gridColumn",
                            "ui.basic.text"
                        ],
                        "ui.data.default": {
                            "ui.basic.tag": "div",
                            "ui.class.class": "app.letters.pronunciation"
                        },
                        "ui.data.values": [
                            "kab.letters.pronunciation"
                        ]
                    }
                }
            ]
        });
    };
    me.exportData = function (object) {
        var window = widget.window.get(object);
        var text = core.property.get(window.var.input, "ui.basic.text");
        return [text];
    };
    me.importData = function (object, text, title) {
        var window = widget.window.get(object);
        core.property.set(window.var.input, "ui.basic.text", text);
        core.property.set(window, "widget.window.name", title);
        me.updateLetters(window);
    };
};
