/*
 @author Zakai Hamilton
 @component UITheme
 */

screens.ui.theme = function UITheme(me, packages) {
    const { core } = packages;
    me.themes = [];
    me.init = async function () {
        me.ui.options.load(me, null, {
            nightMode: true,
            colors: {},
            fontSize: "1em"
        });
        me.ui.options.toggleSet(me, me, {
            "nightMode": me.update
        });
        me.ui.options.choiceSet(me, me, {
            "fontSize": me.updateFontSize
        });
        me.ui.options.listSet(me, me, "colors", me.update);
        me.update();
        me.updateFontSize();
    };
    me.update = function () {
        me.updateColors();
        me.updateElements();
    };
    me.toggleFontSize = function () {
        var fontSize = core.property.get(window.document.body, "ui.style.fontSize");
        core.property.set(me, "ui.theme.fontSize", fontSize !== "16px" ? "1em" : "1.5em");
    };
    me.updateFontSize = function () {
        var fontSize = me.options.fontSize;
        core.property.set(window.document.body, "ui.style.fontSize", fontSize);
        window.dispatchEvent(new Event("resize"));
    };
    me.updateElements = function (parent) {
        var isMobile = core.device.isMobile();
        var nightMode = me.options.nightMode;
        if (!parent) {
            parent = document.body;
        }
        var element = parent.firstElementChild;
        while (element) {
            if (element.classList) {
                if (nightMode) {
                    element.classList.add("night-mode");
                    element.classList.add("is-dark");
                }
                else {
                    element.classList.remove("night-mode");
                    element.classList.remove("is-dark");
                }
                if (isMobile) {
                    element.classList.add("is-mobile");
                }
                if (element.themeMethod) {
                    element.themeMethod(element, nightMode);
                }
            }
            me.updateElements(element);
            element = element.nextElementSibling;
        }
    };
    me.updateColors = function () {
        var colors = {};
        colors = me.json.colors["normal"];
        if (me.options.nightMode) {
            colors = Object.assign({}, colors, me.json.colors["night-mode"]);
        }
        colors = Object.assign({}, colors, me.options.colors);
        for (var name in colors) {
            var color = colors[name];
            me.ui.color.set(name, color);
        }
    };
    return "browser";
};
