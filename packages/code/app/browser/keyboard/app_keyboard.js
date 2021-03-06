/*
 @author Zakai Hamilton
 @component AppKeyboard
 */

screens.app.keyboard = function AppKeyboard(me, { core, ui, widget, kab }) {
    me.launch = function () {
        if (core.property.get(me.singleton, "ui.node.parent")) {
            if (core.property.get(me.singleton, "temp")) {
                core.property.set(me.singleton, "fullscreen", false);
                core.property.set(me.singleton, "nobar", false);
                core.property.set(me.singleton, "temp", false);
            }
            core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = ui.element.create(me.json, "workspace", "self");
        return me.singleton;
    };
    me.click = function (object) {
        var window = widget.window.get(object);
        var input = window.var.input;
        var letter = core.property.get(object, "ui.basic.text");
        if (letter === "⌫") {
            input.value = input.value.slice(0, input.value.length - 1);
        }
        else if (letter === "Space") {
            input.value += " ";
        }
        else {
            input.value += letter;
        }
    };
    me.buttons = function () {
        var values = [];
        var letters = "⌫" + Object.keys(kab.letters.numerologyTable).join("") + " " + "|";
        var info = {
            sources: [
                {
                    letters: letters
                }
            ],
            columnCount: 6,
            endingLetters: "both",
            language: "english"
        };
        kab.letters.letters(info => {
            var method = "app.keyboard.click";
            if (info.text === " ") {
                info.text = "Space";
            }
            values.push([info.row, info.column, info.text, info.pronunciation, info.number, method]);
        }, info);
        return values;
    };
    me.initOptions = function (object) {
        var window = widget.window.get(object);
        ui.options.load(me, window, {
            fontSize: "1em"
        });
        window.options.fontSize = "1em";
        ui.options.choiceSet(me, null, {
            "fontSize": (object, value) => {
                core.property.set(window.var.buttons, "ui.style.fontSize", value);
            }
        });
        core.property.set(window.var.buttons, "ui.style.fontSize", window.options.fontSize);
    };
    me.fontSizesEm = function () {
        var fontSizeList = [];
        var fontSize = 0;
        var item = null;
        for (fontSize = 1; fontSize <= 2.5; fontSize += 0.5) {
            item = [
                fontSize + "em",
                "app.keyboard.fontSize",
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
};
