/*
 @author Zakai Hamilton
 @component WidgetKeyboard
 */

screens.widget.keyboard = function WidgetKeyboard(me) {
    me.element = {
        properties: __json__
    };
    me.keyboard = function () {
        if (me.frame) {
            var isDisplayed = me.core.property.get(me.frame, "ui.basic.display");
            me.core.property.set(me.frame, "ui.basic.display", !isDisplayed);
        }
        else {
            me.frame = me.ui.element.create({
                "ui.element.component": "widget.keyboard"
            });
        }
    };
    me.click = function (object) {
        var keyboard = me.ui.node.container(object, "widget.keyboard");
        var input = keyboard.var.input;
        var letter = me.core.property.get(object, "ui.basic.text");
        if(letter === "⌫") {
            input.value = input.value.slice(0, input.value.length - 1);
        }
        else if(letter === "Space") {
            input.value += " ";
        }
        else {
            input.value += letter;
        }
    };
    me.buttons = function () {
        var values = [];
        var letters ="⌫" + Object.keys(me.kab.letters.numerologyTable).join("") + " ";
        var info = {
            sources: [
                {
                    letters: letters
                }
            ],
            columnCount:6,
            endingLetters: true,
            language: "english"
        };
        me.kab.letters.letters(info => {
            var method = "widget.keyboard.click";
            if(info.text === " ") {
                info.text = "Space";
            }
            values.push([info.row, info.column, info.text, method]);
        }, info);
        return values;
    };
};
