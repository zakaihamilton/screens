/*
 @author Zakai Hamilton
 @component UITransform
 */

screens.ui.transform = function UITransform(me) {
    me.transform = {
        menu: function () {
            var prefix = me.id + ".";
            return [
                [
                    "Translation",
                    prefix + "doTranslation",
                    {
                        "state": "select",
                        "separator": true
                    }
                ],
                [
                    "Keep Source",
                    prefix + "keepSource",
                    {
                        "state": "select"
                    }
                ],
                [
                    "Abridged",
                    prefix + "abridged",
                    {
                        "state": "select"
                    }
                ],
                [
                    "Explanation",
                    prefix + "doExplanation",
                    {
                        "state": "select",
                        "separator": true
                    }
                ],
                [
                    "Prioritize Explanation",
                    prefix + "prioritizeExplanation",
                    {
                        "state": "select"
                    }
                ],
                [
                    "Styles",
                    prefix + "addStyles",
                    {
                        "state": "select",
                        "separator": true
                    }
                ],
                [
                    "Category",
                    prefix + "category",
                    {
                        "state": "select",
                        "enabled": prefix + "category"
                    }
                ],
                [
                    "Headings",
                    prefix + "headings",
                    {
                        "state": "select",
                        "enabled": prefix + "addStyles"
                    }
                ],
                [
                    "Phase Numbers",
                    prefix + "phaseNumbers",
                    {
                        "state": "select",
                        "enabled": prefix + "addStyles"
                    }
                ],
                [
                    "Sub Headings",
                    prefix + "subHeadings",
                    {
                        "state": "select",
                        "enabled": prefix + "addStyles"
                    }
                ],
                [
                    "Language",
                    "header"
                ],
                [
                    "Auto",
                    prefix + "language",
                    {
                        "state": "select"
                    }
                ],
                [
                    "English",
                    prefix + "language",
                    {
                        "state": "select",
                        "separator": true
                    }
                ],
                [
                    "Hebrew",
                    prefix + "language",
                    {
                        "state": "select"
                    }
                ]
            ];
        },
        popup: function () {
            return [
                {
                    "ui.basic.var": "popup",
                    "ui.basic.tag": "div",
                    "ui.basic.html": "@widget.transform.html",
                    "ui.class.add": "modal",
                    "ui.style.zIndex": "1000",
                    "ui.property.after": {
                        "ui.node.parent": "@ui.element.workspace"
                    }
                }
            ];
        },
        options: function () {
            var prefix = me.id + ".";
            return {
                load: {
                    doTranslation: false,
                    doExplanation: true,
                    prioritizeExplanation: true,
                    addStyles: true,
                    abridged: true,
                    keepSource: false,
                    category: true,
                    headings: true,
                    subHeadings: true,
                    language: "Auto",
                    fontSize: "18px",
                    phaseNumbers: true
                },
                toggle: {
                    "doTranslation": prefix + "reload",
                    "doExplanation": prefix + "reload",
                    "prioritizeExplanation": prefix + "reload",
                    "addStyles": prefix + "reload",
                    "phaseNumbers": prefix + "reload",
                    "keepSource": prefix + "reload",
                    "abridged": prefix + "reload",
                    "pages": prefix + "reload",
                    "columns": prefix + "reload",
                    "category": prefix + "reload",
                    "headings": prefix + "reload",
                    "subHeadings": prefix + "reload"
                },
                choice: {
                    "language": prefix + "reload"
                }
            };
        },
        term: async function (object, text) {
            var window = me.widget.window.get(object);
            window.options.clickCallback = "screens.widget.transform.popup.open";
            var language = window.options.language.toLowerCase();
            if (language === "auto") {
                language = "english";
            }
            var array = text;
            if (!Array.isArray(text)) {
                array = [text];
            }
            var options = Object.assign({}, window.options, { category: false });
            var result = await me.core.util.map(array, async (text) => {
                var info = await me.kab.text.parse(language, text, options);
                if (!window.termData) {
                    window.termData = { terms: {} };
                }
                window.termData.terms = Object.assign(window.termData.terms, info.terms);
                return info.text;
            });
            return result.join("<br>");
        }
    };
    return me.transform;
};