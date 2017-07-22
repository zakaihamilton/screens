/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.terms = __json__;
    me.parse = function (wordsString, options) {
        var words = wordsString.split(" ");
        for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
            for (var term in me.terms.terms) {
                var termWords = term.split(" ");
                var numTermWords = termWords.length;
                var collectedWords = words[wordIndex].toLowerCase();
                for (var termWordIndex = 1; termWordIndex < numTermWords; termWordIndex++) {
                    if (wordIndex + termWordIndex >= words.length) {
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
                        expansion = expansion.map(function(item) {
                            return me.parse(item, options);
                        });
                        if (expansion.length > 1) {
                            expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1).toString();
                        } else {
                            expansion = expansion.slice(-1).toString();
                        }
                        words.splice(wordIndex, numTermWords);
                        me.modify(words, wordIndex, item, term, " (", expansion, ")", options);
                    }
                    var translation = item.translation;
                    if (translation) {
                        translation = me.parse(translation, me.duplicateOptions(options, {"addStyles":false}));
                        words.splice(wordIndex, numTermWords);
                        me.modify(words, wordIndex, item, term, " [", translation, "]", options);
                    }
                    if(options.addStyles && !translation && !expansion) {
                        words.splice(wordIndex, numTermWords);
                        me.modify(words, wordIndex, item, term, "", term, "", me.duplicateOptions(options, {"keepSource":false}));
                    }
                    break;
                }
            }
        }
        return words.join(" ");
    };
    me.duplicateOptions = function(options, overrides) {
        var duplicate = {};
        for(var key in options) {
            duplicate[key] = options[key];
        }
        if(overrides) {
            for(var key in overrides) {
                duplicate[key] = overrides[key];
            }
        }
        return duplicate;
    };
    me.modify = function (words, wordIndex, item, term, prefix, replacement, suffix, options) {
        if (!options.doTranslation) {
            replacement = term;
        }
        else if (options.keepSource) {
            replacement = term + prefix + replacement + suffix;
        }
        if (options.addStyles && item.style) {
            var styles = null, html = "";
            if(Array.isArray(item.style)) {
                item.style.map(function(style) {
                    var styles = me.terms.styles[style];
                    html += me.applyStyles(styles, replacement);
                });
            }
            else {
                var styles = me.terms.styles[item.style];
                html += me.applyStyles(styles, replacement);
            }
            replacement = html;
        }
        words.splice(wordIndex, 0, replacement);
    };
    me.applyStyles = function(styles, text) {
        var html = "<span style=\"";
        for(var style in styles) {
            if(style === "content") {
                text = styles[style];
                continue;
            }
            html += style + ":" + styles[style] + ";";
        }
        html += "\">" + text + "</span>";
        return html;
    };
};