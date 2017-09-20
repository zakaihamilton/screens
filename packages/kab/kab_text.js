/*
 @author Zakai Hamilton
 @component KabText
 */

package.kab.text = function KabText(me) {
    me.retrieveTerms = function (callback, language, options) {
        language = language.toLowerCase();
        me.kab.data.load(function (json) {
            var terms = me.send("kab.text.prepare", json, json.term, options, false);
            if (callback) {
                callback(terms);
            }
        }, language);
    };
    me.splitWords = function (session, wordsString) {
        wordsString = me.core.string.parseWords(function (words) {
            if (session.json.options && session.json.options.splitPartial) {
                for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                    var word = words[wordIndex];
                    if (session.terms[word.toUpperCase()]) {
                        continue;
                    }
                    for (var letterIndex = word.length - 2; letterIndex > 1; letterIndex--) {
                        var firstSlice = word.slice(0, letterIndex);
                        var secondSlice = word.slice(letterIndex);
                        if (session.terms[firstSlice] && session.terms[secondSlice]) {
                            if (letterIndex < word.length) {
                                words.splice(wordIndex, 1);
                                words.splice(wordIndex, 0, firstSlice);
                                words.splice(wordIndex + 1, 0, secondSlice);
                            }
                            break;
                        }
                    }
                }
            }
        }, wordsString);
        return wordsString;
    };
    me.parseSingle = function (session, wordsString, depth) {
        var prefix = session.json.prefix;
        var suffix = session.json.suffix;
        var ignore = session.json.ignore;
        var wordStyle = session.json.options.wordStyle;
        if (!wordStyle) {
            wordStyle = "whole";
        }
        if (session.terms) {
            wordsString = me.core.string.parseWords(function (words) {
                var wasPrefix = false;
                for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                    var word = words[wordIndex];
                    var isPrefix = prefix ? word.toLowerCase() in prefix : null;
                    if (isPrefix) {
                        wasPrefix = true;
                        continue;
                    }
                    if (!word) {
                        continue;
                    }
                    word = word.toUpperCase();
                    var termLookup = session.terms[word];
                    if (!termLookup) {
                        if (word.length > 2) {
                            term = session.terms["*"].find(function (term) {
                                return me.core.string.match(word, term, wordStyle);
                            });
                            if (term) {
                                termLookup = session.terms[term];
                            }
                        }
                        if (!termLookup) {
                            wasPrefix = false;
                            continue;
                        }
                    }
                    if (wasPrefix) {
                        wordIndex--;
                        wasPrefix = false;
                    }
                    var subTermNames = termLookup["*"];
                    if (!subTermNames) {
                        continue;
                    }
                    for (var subTermIndex = 0; subTermIndex < subTermNames.length; subTermIndex++) {
                        var term = subTermNames[subTermIndex];
                        var item = termLookup[term];
                        var prefixWord = null;
                        var suffixWord = null;
                        var numTermWords = item.numWords;
                        if (!item.numWords) {
                            numTermWords = item.numWords = term.split(" ").length;
                        }
                        if (item.suffix) {
                            numTermWords++;
                        }
                        var collectedWords = "";
                        for (var termWordIndex = 0; termWordIndex < numTermWords; termWordIndex++) {
                            if (wordIndex + termWordIndex >= words.length) {
                                break;
                            }
                            var word = words[wordIndex + termWordIndex];
                            var prefixTerm = prefix ? word.toLowerCase() in prefix : false;
                            var suffixTerm = suffix ? word.toLowerCase() in suffix : false;
                            var ignoreTerm = ignore ? ignore.includes(word) : false;
                            if (prefixTerm || ignoreTerm || suffixTerm) {
                                if (prefixTerm || suffixTerm || collectedWords) {
                                    if (prefixTerm) {
                                        prefixWord = word;
                                    }
                                    if (suffixTerm) {
                                        suffixWord = word;
                                    }
                                    numTermWords++;
                                    continue;
                                }
                            }
                            if (collectedWords) {
                                collectedWords += " " + word;
                            } else {
                                collectedWords = word;
                            }
                        }
                        var span = numTermWords;
                        var source = collectedWords;
                        var target = term;
                        var upperCase = false;
                        if (item && item.word) {
                            wordStyle = item.word;
                        }
                        if (!me.core.string.match(source, target, wordStyle)) {
                            if (!item.case || item.case !== "sensitive") {
                                if (!me.core.string.match(source, target.toUpperCase(), wordStyle)) {
                                    continue;
                                } else {
                                    upperCase = true;
                                }
                            } else {
                                continue;
                            }
                        }
                        var instance = {
                            item: item,
                            session: session,
                            depth: depth,
                            source: source,
                            target: target,
                            upperCase: upperCase,
                            prefixWord: prefixWord,
                            suffixWord: suffixWord,
                            words: words,
                            wordIndex: wordIndex,
                            span: span
                        };
                        me.handleInstance(session, instance);
                        wordIndex = instance.wordIndex;
                        break;
                    }
                }
            }, wordsString);
        }
        return wordsString;
    };
    me.parse = function (callback, language, wordsString, options) {
        me.kab.data.load(function (json) {
            me.send("kab.search.clear");
            wordsString = me.send("kab.format.spelling", wordsString, json.spelling);
            wordsString = me.send("kab.format.process", wordsString, json.pre);
            var terms = me.send("kab.text.prepare", json, json.term, options);
            var session = {language: language, text: wordsString, options: options, terms: terms, json: json};
            wordsString = me.splitWords(session, wordsString);
            session.text = wordsString;
            wordsString = me.parseSingle(session, wordsString, 0);
            wordsString = me.send("kab.format.process", wordsString, json.post);
            callback(wordsString, me.kab.search.terms, json.data);
        }, language);
    };
    me.handleInstance = function (session, instance) {
        var modify = me.modify;
        var parseSingle = me.parseSingle;
        var expansion = instance.item.expansion;
        var translation = instance.item.translation;
        var explanation = instance.item.explanation;
        var overrideSource = instance.item.source;
        var context = instance.item.context;
        var lastExpansion = "";
        if (session.json.data.lastExpansion) {
            lastExpansion = session.json.data.lastExpansion;
        }
        if (!session.options.doExplanation) {
            explanation = null;
        }
        if (!session.options.doTranslation) {
            if (session.options.doExplanation && !explanation) {
                explanation = translation;
            }
            translation = null;
        }
        if (context) {
            var contextMatch = true;
            if (typeof context === "string") {
                if (!session.text.includes(context)) {
                    contextMatch = false;
                }
            } else if (Array.isArray(context)) {
                context.map(function (entry) {
                    if (!session.text.includes(entry)) {
                        contextMatch = false;
                    }
                });
            }
            if (!contextMatch) {
                return;
            }
        }
        if (expansion) {
            if (Array.isArray(expansion)) {
                expansion = expansion.map(function (text) {
                    if (!text.includes(instance.target)) {
                        text = parseSingle(session, text, instance.depth + 1);
                    }
                    return text;
                });
                if (expansion.length > 1) {
                    expansion = expansion.slice(0, -1).join(", ") + lastExpansion + expansion.slice(-1).toString();
                } else {
                    expansion = expansion.slice(-1).toString();
                }
            } else {
                expansion = parseSingle(session, expansion, instance.depth + 1);
            }
            modify(session, instance, " (", expansion, null, ")", true, session.options.keepSource);
        } else if (translation || explanation) {
            if (translation) {
                if (!instance.item.fixed && translation !== instance.target) {
                    translation = parseSingle(session, translation, instance.depth + 1);
                }
            }
            me.kab.search.setTerm(session.options, session.json.style, instance.item, null, translation, explanation);
            if (translation && instance.upperCase) {
                translation = translation.toUpperCase();
            }
            if (explanation && instance.upperCase) {
                explanation = explanation.toUpperCase();
            }
            modify(session, instance, " [", translation, explanation, "]", false, session.options.keepSource);
        } else if (overrideSource) {
            instance.words.splice(instance.wordIndex, instance.span);
            if (Array.isArray(overrideSource)) {
                instance.words.splice(instance.wordIndex, 0, ...overrideSource);
            } else {
                instance.words.splice(instance.wordIndex, 0, overrideSource);
            }
            instance.wordIndex--;
        } else if (session.options.addStyles && instance.item.style) {
            me.kab.search.setTerm(session.options, session.json.style, instance.item);
            modify(session, instance, "", instance.source, null, "", false, false);
        }
    };
    me.modify = function (session, instance, prefix, translation, explanation, suffix, expansion, keepSource) {
        var replacement = translation;
        if (explanation && translation) {
            if (session.options.prioritizeExplanation) {
                replacement = explanation + " (" + translation + ")";
            } else {
                replacement = translation + " (" + explanation + ")";
            }
        } else if (explanation) {
            replacement = explanation;
        }
        instance.words.splice(instance.wordIndex, instance.span);
        var term = instance.item.source;
        if (instance.item.source) {
            term = instance.item.source;
        }
        if (instance.item.includePrefix && !keepSource) {
            replacement = instance.item.prefix + " " + replacement;
        }
        if (instance.item.quote) {
            replacement = "\"" + replacement + "\"";
        }
        if (!session.options.doTranslation && !session.options.doExplanation) {
            replacement = term;
        } else if (keepSource && term.toLowerCase() !== replacement.toLowerCase()) {
            replacement = term + prefix + replacement + suffix;
        }
        me.kab.format.replaceDuplicate(instance.words, instance.wordIndex, replacement);
        var text = replacement;
        var replacementWithStyles = replacement;
        if (session.options.addStyles && (instance.item.style || translation.toLowerCase() !== instance.target.toLowerCase())) {
            replacementWithStyles = me.kab.style.process(instance.target, instance.item.style, replacement, session.options, expansion, session.json, session.language);
        }
        instance.words.splice(instance.wordIndex, 0, replacementWithStyles);
        if (!instance.item.includePrefix) {
            me.kab.format.insert(instance.words, instance.wordIndex, session.json.prefix, instance.item.prefix, instance.prefixWord, text);
        }
        me.kab.format.insert(instance.words, instance.wordIndex + 1, session.json.suffix, instance.item.suffix, instance.suffixWord, text);
    };
    me.prepare = function (json, terms, options, defaultTermsOnly = true) {
        var result = new Map();
        if (!terms) {
            return null;
        }
        for (var item of terms) {
            var words = item.term.split(" ");
            var key = words[0].toUpperCase();
            var lookup = result[key];
            if (item.defaultTerm || !defaultTermsOnly) {
                me.kab.search.setTerm(options, json.style, item, null, null, null, false);
            }
            if (!lookup) {
                lookup = new Map();
                result[key] = lookup;
                result[words[0]] = lookup;
            }
            lookup[item.term] = item;
        }
        for (var term in result) {
            var lookup = result[term];
            me.sortKeys(lookup);
        }
        me.sortKeys(result);
        return result;
    };
    me.sortKeys = function (dict) {
        var keys = Object.keys(dict);
        keys = keys.sort(function (source, target) {
            return target.length - source.length;
        });
        keys = keys.filter(function (key) {
            return !key.startsWith("!");
        });
        dict["*"] = keys;
    };
};