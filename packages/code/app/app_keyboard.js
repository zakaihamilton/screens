/*
 @author Zakai Hamilton
 @component AppKeyboard
 */

screens.app.keyboard = function AppKeyboard(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            if (me.core.property.get(me.singleton, "temp")) {
                me.core.property.set(me.singleton, "fullscreen", false);
                me.core.property.set(me.singleton, "nobar", false);
                me.core.property.set(me.singleton, "temp", false);
            }
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
        return me.singleton;
    };
    me.click = function (object) {
        var window = me.widget.window.get(object);
        var input = window.var.input;
        var letter = me.core.property.get(object, "ui.basic.text");
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
        var letters = "⌫" + Object.keys(me.kab.letters.numerologyTable).join("") + " " + "|";
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
        me.kab.letters.letters(info => {
            var method = "app.keyboard.click";
            if (info.text === " ") {
                info.text = "Space";
            }
            values.push([info.row, info.column, info.text, info.pronunciation, info.number, method]);
        }, info);
        return values;
    };
};
