/*
 @author Zakai Hamilton
 @component UITransform
 */

screens.ui.transform = function UITransform(me) {
    me.transform = {
        menu: function () {
            var prefix = me.id + ".";
            return [
                {
                    "text": "Clear",
                    "select": prefix + "clear",
                    "options": {
                        "separator": true
                    }
                },
                {
                    "text": "Refresh",
                    "select": prefix + "transform"
                },
                {
                    "text": "Text",
                    "options": {
                        "separator": true
                    },
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
                                "state": "select"
                            }
                        },
                        {
                            "text": "English",
                            "select": prefix + "language",
                            "options": {
                                "state": "select",
                                "separator": true,
                                "value": ""
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
                },
                {
                    "text": "Layout",
                    "select": [
                        {
                            "text": "Reflow",
                            "select": prefix + "reflow"
                        },
                        {
                            "text": "Snap",
                            "select": prefix + "snap",
                            "options": {
                                "state": "select",
                                "separator": true
                            }
                        },
                        {
                            "text": "Pages",
                            "select": prefix + "pages",
                            "options": {
                                "state": "select",
                                "separator": true
                            }
                        },
                        {
                            "text": "Columns",
                            "select": prefix + "columns",
                            "options": {
                                "state": "select",
                                "enabled": prefix + "pages"
                            }
                        },
                        {
                            "text": "Video Slot",
                            "select": prefix + "pipVideo",
                            "options": {
                                "state": "select",
                                "separator": true
                            }
                        },
                        {
                            "text": "Font Size",
                            "select": [
                                prefix + "fontSizesPx(" + prefix + "fontSize)"
                            ]
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