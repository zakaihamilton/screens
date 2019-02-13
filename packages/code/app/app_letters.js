/*
 @author Zakai Hamilton
 @component AppGematria
 */

screens.app.letters = function AppGematria(me) {
    me.ready = async function () {
        await me.ui.content.attach(me);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            if (typeof args[0] === "string") {
                me.content.import(me.singleton, args[0], args[1]);
            }
            else if (Array.isArray(args[0])) {
                me.importData(me.singleton, args[0].join("|"));
            }
            return me.singleton;
        }
        me.singleton = me.ui.element.create(me.json, "workspace", "self");
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
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            fontSize: "4em",
            endingLetters: false,
            numerology: true,
            sumEnabled: true,
            inclusion: false,
            language: "English"
        });
        me.ui.options.toggleSet(me, null, {
            "numerology": me.updateLetters,
            "sumEnabled": me.updateLetters,
            "endingLetters": me.updateLetters,
            "inclusion": me.updateLetters
        });
        me.ui.options.choiceSet(me, null, {
            "fontSize": (object, value) => {
                me.core.property.set(window.var.diagram, "ui.style.fontSize", value);
            },
            "language": me.updateLetters
        });
        me.core.property.set(window.var.diagram, "ui.style.fontSize", window.options.fontSize);
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.input, "ui.basic.text", "");
        me.core.property.set(window, "name", "");
        me.updateLetters(window);
    };
    me.copyUrl = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.input, "ui.basic.text");
        me.core.util.copyUrl("letters", [text]);
    };
    me.updateLetters = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.input, "ui.basic.text");
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
        me.core.property.set(window.var.diagram, "kab.letters.source", info);
        me.core.property.set(window.var.diagram, {
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
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.input, "ui.basic.text");
        return [text];
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.input, "ui.basic.text", text);
        me.core.property.set(window, "widget.window.name", title);
        me.updateLetters(window);
    };
};
