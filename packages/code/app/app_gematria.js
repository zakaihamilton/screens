/*
 @author Zakai Hamilton
 @component AppGematria
 */

screens.app.gematria = function AppGematria(me) {
    me.init = async function () {

    };
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
    me.calcNumerology = function (object) {
        var window = me.singleton;
        var text = me.core.property.get(window.var.input, "ui.basic.text");
        var sources = text.split(" ").map(word => {
            return {
                "verse": word
            };
        });
        var letters = {
            "columnIndex": "4",
            "columnCount": "4",
            "rowIndex": "1",
            "sources": sources
        };
        me.core.property.set(window.var.numerology, "kab.letters.source", letters);
        me.core.property.set(window.var.numerology, {
            "ui.property.style": {
                "display": "grid",
                "position": "absolute",
                "padding": "10px",
                "left": "5px",
                "top": "15px",
                "right": "5px",
                "bottom": "5px",
                "gridGap": "0.5% 1px",
                "alignItems": "stretch",
                "lineHeight": "2em"
            },
            "core.property.group": [
                {
                    "ui.group.data": {
                        "ui.data.keyList": [
                            "ui.style.gridRow",
                            "ui.style.gridColumn",
                            "ui.basic.text",
                            "ui.style.backgroundColor",
                            "ui.style.borderColor"
                        ],
                        "ui.data.default": {
                            "ui.basic.tag": "div",
                            "ui.property.style": {
                                "display": "flex",
                                "alignItems": "center",
                                "justifyContent": "center",
                                "border": "1px solid black",
                                "margin": "0",
                                "textAlign": "center",
                                "verticalAlign": "middle",
                                "paddingBottom": "0.5em"
                            }
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
                            "ui.property.style": {
                                "display": "flex",
                                "alignItems": "flex-end",
                                "justifyContent": "center",
                                "margin": "0",
                                "fontSize": "75%",
                                "textAlign": "center"
                            }
                        },
                        "ui.data.values": [
                            "kab.letters.numerology"
                        ]
                    }
                }
            ]
        });
    };
};
