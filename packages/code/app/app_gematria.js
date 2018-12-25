/*
 @author Zakai Hamilton
 @component AppGematria
 */

screens.app.gematria = function AppGematria(me) {
    me.init = function () {
        me.ui.content.attach(me);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        me.initOptions(me.singleton);
        me.calcNumerology(me.singleton);
        if (typeof args[0] === "string") {
            me.content.import(me.singleton, args[0], args[1]);
        }
        return me.singleton;
    };
    me.initOptions = function (object) {
        var window = me.widget.window.get(object);
        me.ui.options.load(me, window, {
            fontSize: "4em",
            endingLetters: false,
            sumEnabled: true,
            language: "English"
        });
        me.ui.options.toggleSet(me, null, {
            "sumEnabled": me.calcNumerology,
            "endingLetters": me.calcNumerology
        });
        me.ui.options.choiceSet(me, null, {
            "fontSize": (object, value) => {
                me.core.property.set(window.var.diagram, "ui.style.fontSize", value);
            },
            "language": me.calcNumerology
        });
        me.core.property.set(window.var.diagram, "ui.style.fontSize", window.options.fontSize);
    };
    me.copyUrl = function (object) {
        var window = me.widget.window.get(object);
        var text = me.core.property.get(window.var.input, "ui.basic.text");
        me.core.util.copyUrl("gematria", [text]);
    };
    me.calcNumerology = function (object) {
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
            "endingLetters": window.options.endingLetters
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
                            "ui.class.class": "app.gematria.letter"
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
                            "ui.class.class": "app.gematria.number"
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
                            "ui.class.class": "app.gematria.pronunciation"
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
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.input, "ui.basic.text", text);
        me.core.property.set(window, "widget.window.name", title);
        me.calcNumerology(window);
    };
};
