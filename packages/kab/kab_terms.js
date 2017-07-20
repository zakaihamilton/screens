/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.terms = __json__;
    me.parse = function (words, keepSource) {
        for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
            for (var term in me.terms.terms) {
                var termWords = term.split(" ");
                var numTermWords = termWords.length;
                var collectedWords = words[wordIndex].toLowerCase();
                for (var termWordIndex = 1; termWordIndex < numTermWords; termWordIndex++) {
                    if(wordIndex + numTermWords > words.length) {
                        break;
                    }
                    collectedWords += " " + words[wordIndex + termWordIndex].toLowerCase();
                }
                if (term.toLowerCase() === collectedWords) {
                    var item = me.terms.terms[term];
                    var expansion = item.expansion;
                    if (expansion) {
                        expansion = [].concat(expansion);
                        me.parse(expansion, keepSource);
                        if(expansion.length > 1) {
                            expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1);
                        }
                        else {
                            expansion = expansion.slice(-1);
                        }
                        words.splice(wordIndex, numTermWords);
                        if (keepSource) {
                            words.splice(wordIndex, 0, term + " (" + expansion + ")");
                        } else {
                            words.splice(wordIndex, 0, expansion);
                        }
                    }
                    var translation = item.translation;
                    if(translation) {
                        words.splice(wordIndex, numTermWords);
                        if (keepSource) {
                            words.splice(wordIndex, 0, term + " [" + translation + "]");
                        } else {
                            words.splice(wordIndex, 0, translation);
                        }
                    }
                    break;
                }
            }
        }
    };
};