/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.init = function () {
        me.json = null;
    };
    me.setLanguage = function (callback, language) {
        me.core.json.load(function (json) {
            if (json) {
                me.json = json;
                var numTerms = 0;
                if (me.json.terms) {
                    numTerms = Object.keys(me.json.terms).length;
                }
                me.core.console.log("using language: " + language + " with " + numTerms + " terms");
                if (callback) {
                    callback();
                }
            }
        }, "kab.terms_" + language.toLowerCase());
    };
    me.parse = function (callback, wordsString, options) {
        var result = null;
        if (!me.json) {
            if (callback) {
                callback(wordsString);
                return;
            }
            return wordsString;
        }
        if (callback) {
            me.diagrams = {};
            wordsString = me.format(wordsString);
        }
        var terms = me.json.terms;
        if (terms) {
            var termNames = Object.keys(terms).sort(function (source, target) {
                return target.length - source.length;
            });
            wordsString = me.core.string.parseWords(function (words) {
                for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                    for (var termIndex = 0; termIndex < termNames.length; termIndex++) {
                        var term = termNames[termIndex];
                        if (term.startsWith("!")) {
                            continue;
                        }
                        var item = terms[term];
                        var termWords = term.split(" ");
                        var numTermWords = termWords.length;
                        var collectedWords = words[wordIndex];
                        for (var termWordIndex = 1; termWordIndex < numTermWords; termWordIndex++) {
                            if (wordIndex + termWordIndex >= words.length) {
                                break;
                            }
                            var word = words[wordIndex + termWordIndex];
                            var matchingTerm = terms[word];
                            if (matchingTerm && matchingTerm.ignore) {
                                numTermWords++;
                                continue;
                            }
                            collectedWords += " " + word;
                        }
                        if (me.match(item, term, collectedWords)) {
                            var expansion = item.expansion;
                            if (expansion) {
                                expansion = [].concat(expansion);
                                expansion = expansion.map(function (item) {
                                    return me.parse(null, item, options);
                                });
                                if (expansion.length > 1) {
                                    expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1).toString();
                                } else {
                                    expansion = expansion.slice(-1).toString();
                                }
                                words.splice(wordIndex, numTermWords);
                                me.modify(words, wordIndex, item, collectedWords, " (", expansion, ")", options, true);
                            }
                            var translation = item.translation;
                            if (translation) {
                                if (!item.name) {
                                    translation = me.parse(null, translation, me.duplicateOptions(options, {"addStyles": false}));
                                }
                                words.splice(wordIndex, numTermWords);
                                me.modify(words, wordIndex, item, collectedWords, " [", translation, "]", options);
                            }
                            if (options.addStyles && !translation && !expansion) {
                                words.splice(wordIndex, numTermWords);
                                me.modify(words, wordIndex, item, collectedWords, "", collectedWords, "", me.duplicateOptions(options, {"keepSource": false}));
                            }
                            break;
                        }
                    }
                }
            }, wordsString);
        }
        if (callback) {
            callback(wordsString);
            return;
        }
        return wordsString;
    };
    me.format = function (wordsString) {
        var format = me.json.format;
        if (format) {
            format.map(function (item) {
                var find = item.find;
                if (find) {
                    if (find.startsWith("/")) {
                        find = find.slice(1);
                        find = new RegExp(find);
                    }
                    wordsString = wordsString.split(find).join(item.replace);
                }
                if (item.prefix) {
                    wordsString = item.prefix + wordsString;
                }
                if (item.suffix) {
                    wordsString = wordsString + item.suffix;
                }
            });
        }
        return wordsString;
    };
    me.toCase = function (item, string) {
        var itemCase = "sensitive";
        if (item.case) {
            itemCase = item.case;
        }
        if (itemCase !== "sensitive") {
            string = string.toLowerCase();
        }
        return string;
    };
    me.match = function (item, source, target) {
        source = me.toCase(item, source);
        target = me.toCase(item, me.clean(target));
        if (source.startsWith("/")) {
            source = source.slice(1);
            return new RegExp(source).test(target);
        }
        var wordStyle = "whole";
        if (item.word) {
            wordStyle = item.word;
        }
        if (wordStyle === "whole") {
            return source === target;
        } else if (wordStyle === "prefix") {
            return target.beginsWith(source);
        } else if (wordStyle === "suffix") {
            return target.endsWith(source);
        } else {
            return target.search(source) !== -1;
        }
    };
    me.clean = function (word) {
        if (word.startsWith("“")) {
            word = word.slice(1);
        }
        if (word.startsWith("ֿֿֿ\"")) {
            word = word.slice(1);
        }
        if (word.endsWith("ֿֿֿ\"")) {
            word = word.slice(0, -1);
        }
        return word;
    };
    me.duplicateOptions = function (options, overrides) {
        var duplicate = {};
        for (var key in options) {
            duplicate[key] = options[key];
        }
        if (overrides) {
            for (var key in overrides) {
                duplicate[key] = overrides[key];
            }
        }
        return duplicate;
    };
    me.modify = function (words, wordIndex, item, term, prefix, replacement, suffix, options, expansion) {
        if (!options.doTranslation) {
            replacement = term;
        } else if (options.keepSource) {
            replacement = term + prefix + replacement + suffix;
        }
        if (options.addStyles && (item.style || replacement !== term)) {
            replacement = me.applyStyles(term, item.style, replacement, options, expansion);
        }
        words.splice(wordIndex, 0, replacement);
    };
    me.applyStyles = function (term, styles, text, options, expansion) {
        var html = "";
        if (styles && styles.heading) {
            html += "<span class=\"kab-term-heading\">" + styles.heading + "</span>";
        }
        if (styles && styles.diagram) {
            if (!me.diagrams[styles.diagram]) {
                var diagram = me.json.diagrams[styles.diagram];
                html += "<span class=\"kab-term-" + diagram.class + "\" " + diagram.attributes + ">";
                html += "<img src=\"packages/res/diagrams/" + diagram.img.toLowerCase() + "\" style=\"width:100%;padding-bottom:15px;border-bottom:1px solid black;\"></img><span>" + diagram.title + "</span>";
                html += "</span>";
            }
            me.diagrams[styles.diagram] = true;
        }
        if (styles && styles.bold) {
            html += "<b>";
        }
        if (styles && styles.phase) {
            html += "<span class=\"kab-term-phase-" + styles.phase;
            html += "\" ";
            if (!options.keepSource && !expansion && options.doTranslation) {
                html += " kab-term-tooltip=\"" + term + "\"";
            }
            html += ">" + text + "</span>";
        } else if (!options.keepSource && !expansion) {
            html += "<span class=\"kab-term-phase-none";
            html += "\" ";
            html += " kab-term-tooltip=\"" + term + "\"";
            html += ">" + text + "</span>";
        } else {
            html += text;
        }
        if (styles && styles.bold) {
            html += "</b>";
        }
        return html;
    };
};