/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.terms = __json__;
    me.parse = function (words, addStyles=true, keepSource=true, doTranslation=true) {
        for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
            for (var term in me.terms.terms) {
                var termWords = term.split(" ");
                var numTermWords = termWords.length;
                var collectedWords = words[wordIndex].toLowerCase();
                for (var termWordIndex = 1; termWordIndex < numTermWords; termWordIndex++) {
                    if (wordIndex + numTermWords > words.length) {
                        break;
                    }
                    var word = words[wordIndex + termWordIndex];
                    var matchingTerm = me.terms.terms[word];
                    if(matchingTerm && matchingTerm.ignore) {
                        numTermWords++;
                        continue;
                    }
                    collectedWords += " " + word.toLowerCase();
                }
                if (term.toLowerCase() === collectedWords) {
                    var item = me.terms.terms[term];
                    var expansion = item.expansion;
                    if (expansion) {
                        expansion = [].concat(expansion);
                        me.parse(expansion, addStyles, keepSource, doTranslation);
                        if (expansion.length > 1) {
                            expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1);
                        } else {
                            expansion = expansion.slice(-1);
                        }
                        words.splice(wordIndex, numTermWords);
                        me.modify(words, wordIndex, item, term, " (", expansion, ")", addStyles, keepSource, true);
                    }
                    var translation = item.translation;
                    if (translation) {
                        translation = me.parse(translation.split(" "), false, keepSource).join(" ");
                        words.splice(wordIndex, numTermWords);
                        me.modify(words, wordIndex, item, term, " [", translation, "]", addStyles, keepSource, doTranslation);
                    }
                    break;
                }
            }
        }
        return words;
    };
    me.modify = function (words, wordIndex, item, term, prefix, replacement, suffix, addStyles, keepSource, doTranslation) {
        if (!doTranslation) {
            replacement = term;
        }
        else if (keepSource) {
            replacement = term + prefix + replacement + suffix;
        }
        if (addStyles && item.style) {
            var styles = me.terms.styles[item.style];
            if(styles) {
                var html = "<span style=\"";
                for(var style in styles) {
                    html += style + ":" + styles[style] + ";";
                }
                html += "\">" + replacement + "</span>";
                replacement = html;
            }
        }
        words.splice(wordIndex, 0, replacement);
    };
};