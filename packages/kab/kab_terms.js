/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.terms = __json__;
    me.parse = function (words, index, keepSource) {
        var found = false;
        for (var term in me.terms.terms) {
            var termWords = term.split(" ");
            var numTermWords = termWords.length;
            var collectedWords = words[index];
            for (var wordIndex = 1; wordIndex < numTermWords; wordIndex++) {
                collectedWords += " " + words[index + wordIndex];
            }
            if (term.toLowerCase() === collectedWords.toLowerCase()) {
                var translation = me.terms.terms[term].translation;
                if (keepSource) {
                    words.splice(index+1, 0, "[" + translation + "]");
                }
                else {
                    words.splice(index, numTermWords);
                    words.splice(index, 0, translation);
                }
                found = true;
                break;
            }
        }
        index++;
        if (index >= words.length) {
            index = 0;
        }
        return index;
    };
};