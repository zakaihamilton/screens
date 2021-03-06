/*
 @author Zakai Hamilton
 @component UITransform
 */

screens.ui.transform = function UITransform(me, { core, widget, kab }) {
    me.transform = {
        menu: function () {
            var prefix = me.id + ".";
            return [
                {
                    "text": "Font Size",
                    "select": [
                        "widget.transform.fontSizesPx(" + prefix + "fontSize)"
                    ]
                },
                {
                    "text": "Text",
                    "select": [
                        {
                            "text": "Translation",
                            "select": prefix + "doTranslation",
                            "options": {
                                "state": "select"
                            }
                        },
                        {
                            "text": "Source",
                            "select": prefix + "keepSource",
                            "options": {
                                "state": "select"
                            }
                        },
                        {
                            "text": "Abridged",
                            "select": prefix + "abridged",
                            "options": {
                                "state": "select"
                            }
                        },
                        {
                            "text": "Show",
                            "options": {
                                "separator": true
                            },
                            "select": [
                                {
                                    "text": "Parentheses",
                                    "select": prefix + "parentheses",
                                    "options": {
                                        "state": "select"
                                    }
                                },
                                {
                                    "text": "Brackets",
                                    "select": prefix + "brackets",
                                    "options": {
                                        "state": "select"
                                    }
                                }
                            ]
                        },
                        {
                            "text": "Explanation",
                            "select": prefix + "doExplanation",
                            "options": {
                                "state": "select",
                                "separator": true
                            }
                        },
                        {
                            "text": "Prioritize Explanation",
                            "select": prefix + "prioritizeExplanation",
                            "options": {
                                "state": "select"
                            }
                        }
                    ]
                },
                {
                    "text": "Styles",
                    "select": prefix + "addStyles",
                    "options": {
                        "state": "select",
                        "separator": true
                    }
                },
                {
                    "text": "Adornments",
                    "select": [
                        {
                            "text": "Category",
                            "select": prefix + "category",
                            "options": {
                                "state": "select",
                                "enabled": prefix + "addStyles"
                            }
                        },
                        {
                            "text": "Headings",
                            "select": prefix + "headings",
                            "options": {
                                "state": "select",
                                "enabled": prefix + "addStyles"
                            }
                        },
                        {
                            "text": "Phase Numbers",
                            "select": prefix + "phaseNumbers",
                            "options": {
                                "state": "select",
                                "enabled": prefix + "addStyles"
                            }
                        },
                        {
                            "text": "Sub Headings",
                            "select": prefix + "subHeadings",
                            "options": {
                                "state": "select",
                                "enabled": prefix + "addStyles"
                            }
                        }
                    ]
                },
                {
                    "text": "Language",
                    "options": {
                        "separator": true
                    },
                    "select": [
                        {
                            "text": "Auto",
                            "select": prefix + "language",
                            "options": {
                                "state": "select"
                            }
                        },
                        {
                            "text": "None",
                            "select": prefix + "language",
                            "options": {
                                "state": "select",
                                "value": ""
                            }
                        },
                        {
                            "text": "English",
                            "select": prefix + "language",
                            "options": {
                                "state": "select",
                                "separator": true
                            }
                        },
                        {
                            "text": "Hebrew",
                            "select": prefix + "language",
                            "options": {
                                "state": "select"
                            }
                        }
                    ]
                }
            ];
        },
        popup: function () {
            return [
                {
                    "ui.basic.var": "popup",
                    "ui.basic.tag": "div",
                    "ui.basic.html": "@widget.transform.html",
                    "ui.class.class": "widget.transform.popup",
                    "ui.class.add": "modal",
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
                    brackets: true,
                    parentheses: true,
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
                    "brackets": prefix + "reload",
                    "parentheses": prefix + "reload",
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
            var window = widget.window.get(object);
            window.options.clickCallback = "screens.widget.transform.popup.open";
            var language = window.options.language.toLowerCase();
            if (language === "auto") {
                language = "english";
            }
            var array = text;
            if (!Array.isArray(text)) {
                array = [text];
            }
            var options = Object.assign({}, window.options);
            options.ignorePrefix = true;
            var result = await core.util.map(array, async (text) => {
                var info = await kab.text.parse(language, text, options);
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