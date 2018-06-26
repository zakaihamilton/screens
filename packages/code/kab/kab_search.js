/*
 @author Zakai Hamilton
 @component KabSearch
 */

screens.kab.search = function KabSearch(me) {
    me.init = function () {
        me.terms = {};
    };
    me.clear = function () {
        me.terms = {};
    };
    me.setTerm = function (options, styles, item, source, translation, explanation, used = true) {
        if (!("search" in item) || item.search === true) {
            if (!source) {
                source = item.source ? item.source : item.term;
            }
            if (!translation && options.doTranslation) {
                translation = item.translation;
            }
            if (!explanation && options.doExplanation) {
                explanation = item.explanation;
            }
            if (item.includePrefix) {
                translation = item.prefix + " " + translation;
            }
            var term = source;
            if (explanation && translation) {
                if (options.prioritizeExplanation) {
                    term = explanation + " (" + translation + ")";
                } else {
                    term = translation + " (" + explanation + ")";
                }
            } else if (explanation) {
                term = explanation;
            } else if (translation) {
                term = translation;
            }
            var searchTerm = me.terms[source];
            if (!searchTerm) {
                searchTerm = me.terms[source] = { count: 0 };
            }
            searchTerm.count++;
            searchTerm.term = item.term;
            if(used || !searchTerm.used) {
                searchTerm.used = used;
            }
            if (item.label) {
                searchTerm.source = item.label;
            } else {
                searchTerm.source = source;
            }
            searchTerm.source = me.core.string.unparseWords(searchTerm.source);
            if (item.style) {
                var style = item.style;
                if (typeof style === "string" && styles) {
                    style = styles[style];
                }
                searchTerm.heading = style.heading;
                searchTerm.phase = style.phase;
                searchTerm.tooltip = style.tooltip;
            }
            else {
                searchTerm.heading = null;
                searchTerm.phase = null;
                searchTerm.tooltip = null;
            }
        }
    };

};