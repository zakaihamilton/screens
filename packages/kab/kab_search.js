/*
 @author Zakai Hamilton
 @component KabSearch
 */

package.kab.search = function KabSearch(me) {
    me.init = function() {
        me.terms = {};
    };
    me.clear = function() {
        me.terms = {};
    };
    me.setTerm = function (options, item, source, translation, explanation, used = true) {
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
            var searchTerm = me.terms[term];
            if (!searchTerm) {
                searchTerm = me.terms[term] = {count: 0};
            }
            searchTerm.count++;
            searchTerm.used = used;
            if (item.label) {
                searchTerm.source = item.label;
            } else {
                searchTerm.source = item.source ? item.source : source;
            }
            if (item.style) {
                searchTerm.heading = item.style.heading;
                searchTerm.phase = item.style.phase;
            }
    }
    };
    
};