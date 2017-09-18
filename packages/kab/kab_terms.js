/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.init = function () {
        me.jsons = {};
        me.json = null;
        me.terms = null;
        me.content = null;
        me.language = "english";
    };
    me.setLanguage = function (callback, language) {
        language = language.toLowerCase();
        if (me.jsons[language]) {
            var json = me.jsons[language];
            if (callback) {
                callback(json);
            }
        } else {
            me.core.json.loadFile(function (json) {
                if (json) {
                    me.jsons[language] = json;
                    if (callback) {
                        callback(json);
                    }
                }
            }, "/packages/res/terms/" + language + ".json");
        }
    };
    me.retrieveTerms = function(callback, language, options) {
        me.language = language.toLowerCase();
        me.json = me.jsons[me.language];
        if (!me.json) {
            if (callback) {
                callback(null);
                return null;
            }
        }
        me.terms = me.send("kab.terms.prepare", me.json.term, options, false);
        if(callback) {
            callback(me.kab.search.terms);
        }
        return me.kab.search.terms;
    };
    me.parse = function (callback, language, wordsString, options) {
        me.language = language.toLowerCase();
        me.json = me.jsons[me.language];
        if (!me.json) {
            if (callback) {
                callback(wordsString);
                return;
            }
            return wordsString;
        }
        var match = me.match;
        var modify = me.modify;
        var duplicateOptions = me.duplicateOptions;
        var parse = me.parse;
        var prefix = me.json.prefix;
        var suffix = me.json.suffix;
        var ignore = me.json.ignore;
        if (callback) {
            me.send("kab.search.clear");
            wordsString = me.send("kab.format.spelling", wordsString, me.json.spelling);
            wordsString = me.send("kab.format.process", wordsString, me.json.pre);
            me.terms = me.send("kab.terms.prepare", me.json.term, options);
            me.content = wordsString;
        }
        var terms = me.terms;
        if (terms) {
            wordsString = me.core.string.parseWords(function (words) {
                var wasPrefix = false;
                if (callback && me.json.options && me.json.options.splitPartial) {
                    for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                        var word = words[wordIndex];
                        if (terms[word.toUpperCase()]) {
                            continue;
                        }
                        for (var letterIndex = word.length - 2; letterIndex > 1; letterIndex--) {
                            var firstSlice = word.slice(0, letterIndex);
                            var secondSlice = word.slice(letterIndex);
                            if (terms[firstSlice] && terms[secondSlice]) {
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
                    var termLookup = terms[word];
                    if (!termLookup) {
                        if (word.length > 2) {
                            term = terms["*"].find(function (term) {
                                return match(null, word, term);
                            });
                            if (term) {
                                termLookup = terms[term];
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
                        if (!match(item, source, target)) {
                            if (!item.case || item.case !== "sensitive") {
                                if (!match(item, source, target.toUpperCase())) {
                                    continue;
                                } else {
                                    upperCase = true;
                                }
                            } else {
                                continue;
                            }
                        }
                        var expansion = item.expansion;
                        var translation = item.translation;
                        var explanation = item.explanation;
                        var overrideSource = item.source;
                        var context = item.context;
                        if (!options.doExplanation) {
                            explanation = null;
                        }
                        if (!options.doTranslation) {
                            if (options.doExplanation && !explanation) {
                                explanation = translation;
                            }
                            translation = null;
                        }
                        if (context) {
                            var contextMatch = true;
                            if (typeof context === "string") {
                                if (!me.content.includes(context)) {
                                    contextMatch = false;
                                }
                            } else if (Array.isArray(context)) {
                                context.map(function (entry) {
                                    if (!me.content.includes(entry)) {
                                        contextMatch = false;
                                    }
                                });
                            }
                            if (!contextMatch) {
                                continue;
                            }
                        }
                        if (expansion) {
                            if (Array.isArray(expansion)) {
                                expansion = expansion.map(function (text) {
                                    if (!text.includes(term)) {
                                        text = parse(null, me.language, text, options);
                                    }
                                    return text;
                                });
                                if (expansion.length > 1) {
                                    expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1).toString();
                                } else {
                                    expansion = expansion.slice(-1).toString();
                                }
                            } else {
                                expansion = parse(null, me.language, expansion, options);
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " (", expansion, null, ")", options, true);
                        } else if (translation || explanation) {
                            if (translation) {
                                if (!item.fixed && translation !== term) {
                                    translation = parse(null, me.language, translation, duplicateOptions(options, {"addStyles": false}));
                                }
                            }
                            me.kab.search.setTerm(options, me.json.style, item, null, translation, explanation);
                            if (translation && upperCase) {
                                translation = translation.toUpperCase();
                            }
                            if (explanation && upperCase) {
                                explanation = explanation.toUpperCase();
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " [", translation, explanation, "]", options);
                        } else if (overrideSource) {
                            words.splice(wordIndex, span);
                            if (Array.isArray(overrideSource)) {
                                words.splice(wordIndex, 0, ...overrideSource);
                            } else {
                                words.splice(wordIndex, 0, overrideSource);
                            }
                            wordIndex--;
                        } else if (options.addStyles && item.style) {
                            me.kab.search.setTerm(options, me.json.style, item);
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, "", source, null, "", duplicateOptions(options, {"keepSource": false}));
                        }
                        break;
                    }
                }
            }, wordsString);
        }
        if (callback) {
            wordsString = me.send("kab.format.process", wordsString, me.json.post);
            callback(wordsString, me.kab.search.terms, me.json.data);
            return;
        }
        return wordsString;
    };
    me.toCase = function (item, string) {
        var itemCase = "insensitive";
        if (item.case) {
            itemCase = item.case;
        }
        if (itemCase !== "sensitive") {
            string = string.toUpperCase();
        }
        return string;
    };
    me.match = function (item, source, target) {
        var wordStyle = "whole";
        if (me.json.options && me.json.options.wordStyle) {
            wordStyle = me.json.options.wordStyle;
        }
        if (item && item.word) {
            wordStyle = item.word;
        }
        if (wordStyle === "whole") {
            return source === target;
        } else if (wordStyle === "prefix") {
            return source.beginsWith(target);
        } else if (wordStyle === "suffix") {
            return source.endsWith(target);
        } else {
            return source.includes(target);
        }
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
    me.modify = function (words, wordIndex, sourceLength, prefixWord, suffixWord, item, term, prefix, translation, explanation, suffix, options, expansion) {
        var replacement = translation;
        if (explanation && translation) {
            if(options.prioritizeExplanation) {
                replacement = explanation + " (" + translation + ")";
            }
            else {
                replacement = translation + " (" + explanation + ")";
            }
        } else if (explanation) {
            replacement = explanation;
        }
        words.splice(wordIndex, sourceLength);
        if (item.source) {
            term = item.source;
        }
        if (item.includePrefix && !options.keepSource) {
            replacement = item.prefix + " " + replacement;
        }
        if (item.quote) {
            replacement = "\"" + replacement + "\"";
        }
        if (!options.doTranslation && !options.doExplanation) {
            replacement = term;
        } else if (options.keepSource && term.toLowerCase() !== replacement.toLowerCase()) {
            replacement = term + prefix + replacement + suffix;
        }
        me.kab.format.replaceDuplicate(words, wordIndex, replacement);
        var text = replacement;
        var replacementWithStyles = replacement;
        if (options.addStyles && (item.style || translation.toLowerCase() !== term.toLowerCase())) {
            replacementWithStyles = me.kab.style.process(term, item.style, replacement, options, expansion, me.json, me.language);
        }
        words.splice(wordIndex, 0, replacementWithStyles);
        if (!item.includePrefix) {
            me.kab.format.insert(words, wordIndex, me.json.prefix, item.prefix, prefixWord, text);
        }
        me.kab.format.insert(words, wordIndex + 1, me.json.suffix, item.suffix, suffixWord, text);
    };
    me.prepare = function (terms, options, defaultTermsOnly=true) {
        var result = new Map();
        if(!terms) {
            return null;
        }
        for (var item of terms) {
            var words = item.term.split(" ");
            var key = words[0].toUpperCase();
            var lookup = result[key];
            if(item.defaultTerm || !defaultTermsOnly) {
                me.kab.search.setTerm(options, me.json.style, item, null, null, null, false);
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