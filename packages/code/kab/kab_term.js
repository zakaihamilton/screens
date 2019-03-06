/*
 @author Zakai Hamilton
 @component KabTerm
 */

screens.kab.term = function KabTerm(me, packages) {
    const { core } = packages;
    me.init = function () {
        me.terms = {};
    };
    me.clear = function () {
        me.terms = {};
    };
    me.setTerm = function (options, styles, item, source, translation, explanation, used = true) {
        if (!source) {
            source = item.source ? item.source : item.term;
        }
        if (!translation && options.doTranslation) {
            translation = item.translation;
        }
        if (!explanation && options.doExplanation) {
            explanation = item.explanation;
        }
        if (item.includePrefix && translation) {
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
        var theTerm = me.terms[item.term];
        if (!theTerm) {
            theTerm = me.terms[item.term] = { count: 0 };
        }
        theTerm.count++;
        theTerm.text = term;
        theTerm.term = item.term;
        if (used || !theTerm.used) {
            theTerm.used = used;
        }
        if (item.label) {
            theTerm.source = item.label;
        } else {
            theTerm.source = source;
        }
        theTerm.item = item;
        theTerm.source = core.string.unparseWords(theTerm.source);
        if (item.style) {
            var style = item.style;
            if (typeof style === "string" && styles) {
                style = styles[style];
            }
            theTerm.category = style.category;
            theTerm.phase = style.phase;
            theTerm.tooltip = style.tooltip;
            theTerm.style = style;
        }
        else {
            theTerm.category = null;
            theTerm.phase = null;
            theTerm.tooltip = null;
            theTerm.style = null;
        }
    };
};