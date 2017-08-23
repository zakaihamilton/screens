/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.init = function () {
        me.json = null;
        me.terms = null;
        me.searchTerms = [];
        me.content = null;
        me.language = "english";
    };
    me.setLanguage = function (callback, language) {
        me.language = language.toLowerCase();
        me.core.json.load(function (json) {
            if (json) {
                me.json = json;
                var numTerms = 0;
                if (me.json.terms) {
                    numTerms = Object.keys(me.json.terms).length;
                }
                if (callback) {
                    callback(numTerms);
                }
            }
        }, "kab.terms_" + me.language);
    };
    me.parse = function (callback, wordsString, options) {
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
            me.diagrams = {};
            me.searchTerms = {};
            wordsString = me.send("kab.terms.fixSpelling", wordsString);
            wordsString = me.send("kab.terms.format", wordsString, me.json.pre);
            me.terms = me.send("kab.terms.prepare", me.json.terms);
            me.content = wordsString;
        }
        var terms = me.terms;
        if (terms) {
            wordsString = me.core.string.parseWords(function (words) {
                var wasPrefix = false;
                if(callback) {
                    for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                        var word = words[wordIndex];
                        if(terms[word.toUpperCase()]) {
                            continue;
                        }
                        for(var letterIndex = word.length - 2; letterIndex > 1; letterIndex--) {
                            var firstSlice = word.slice(0, letterIndex);
                            var secondSlice = word.slice(letterIndex);
                            if(terms[firstSlice] && terms[secondSlice]) {
                                if(letterIndex < word.length) {
                                    words.splice(wordIndex, 1);
                                    words.splice(wordIndex, 0, firstSlice);
                                    words.splice(wordIndex+1, 0, secondSlice);
                                }
                                break;
                            }
                        }
                    }
                }
                for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                    var word = words[wordIndex];
                    var isPrefix = prefix ? word.toLowerCase() in prefix : null;
                    if(isPrefix) {
                        wasPrefix = true;
                        continue;
                    }
                    word = word.toUpperCase();
                    var termLookup = terms[word];
                    if(!termLookup) {
                        wasPrefix = false;
                        continue;
                    }
                    if(wasPrefix) {
                        wordIndex--;
                        wasPrefix = false;
                    }
                    var subTermNames = termLookup["*"];
                    for (var subTermIndex = 0; subTermIndex < subTermNames.length; subTermIndex++) {
                        var term = subTermNames[subTermIndex];
                        var item = termLookup[term];
                        var prefixWord = null;
                        var suffixWord = null;
                        var numTermWords = item.numWords;
                        if(!item.numWords) {
                            numTermWords = item.numWords = term.split(" ").length;
                        }
                        if(item.suffix) {
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
                                    if(prefixTerm) {
                                        prefixWord = word;
                                    }
                                    if(suffixTerm) {
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
                            if(!item.case || item.case !== "sensitive") {
                                if (!match(item, source, target.toUpperCase())) {
                                    continue;
                                }
                                else {
                                    upperCase = true;
                                }
                            }
                            else {
                                continue;
                            }
                        }
                        var expansion = item.expansion;
                        var translation = item.translation;
                        var reorder = item.reorder;
                        var context = item.context;
                        if(context) {
                            var contextMatch = true;
                            if(typeof context === "string") {
                                if(!me.content.includes(context)) {
                                    contextMatch = false;
                                }
                            }
                            else if(Array.isArray(context)) {
                                context.map(function(entry) {
                                    if(!me.content.includes(entry)) {
                                        contextMatch = false;
                                    }
                                });
                            }
                            if(!contextMatch) {
                                continue;
                            }
                        }
                        if (expansion) {
                            if(Array.isArray(expansion)) {
                                expansion = expansion.map(function (text) {
                                    if(!text.includes(term)) {
                                        text = parse(null, text, options);
                                    }
                                    return text;
                                });
                                if (expansion.length > 1) {
                                    expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1).toString();
                                } else {
                                    expansion = expansion.slice(-1).toString();
                                }
                            }
                            else {
                                expansion = parse(null, expansion, options);
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " (", expansion, ")", options, true);
                        }
                        else if (options.doTranslation && translation) {
                            if (!item.name) {
                                translation = me.parse(null, translation, duplicateOptions(options, {"addStyles": false}));
                            }
                            if(!("search" in item) || item.search === true) {
                                var usedTerm = me.searchTerms[translation];
                                if(!usedTerm) {
                                    usedTerm = me.searchTerms[translation] = {count:0};
                                }
                                usedTerm.count++;
                                if(item.label) {
                                    usedTerm.label = item.label;
                                }
                                else {
                                    usedTerm.label = term;
                                }
                            }
                            if(upperCase) {
                                translation = translation.toUpperCase();
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " [", translation, "]", options);
                        }
                        else if(options.doTranslation && !options.keepSource && reorder) {
                            words.splice(wordIndex, span);
                            words.splice(wordIndex, 0, ...reorder);
                            wordIndex--;
                        }
                        else if (options.addStyles && item.style) {
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, "", source, "", duplicateOptions(options, {"keepSource": false}));
                        }
                        break;
                    }
                }
            }, wordsString);
        }
        if (callback) {
            if (me.language !== "debug") {
                wordsString = me.send("kab.terms.format", wordsString, me.json.post);
                wordsString = me.send("kab.terms.removeDuplicates", wordsString, "(", ")");
                wordsString = me.send("kab.terms.removeDuplicates", wordsString, "[", "]");
            }
            callback(wordsString, me.searchTerms);
            return;
        }
        return wordsString;
    };
    me.insert = function(words, wordIndex, collection, defaultWord, wordToInsert, text) {
        if(collection && wordToInsert) {
            for(var itemName in collection) {
                var item = collection[itemName];
                if(!item.match) {
                    continue;
                }
                if(itemName !== wordToInsert.toLowerCase()) {
                    continue;
                }
                if(!defaultWord) {
                    for(var altPrefix in collection) {
                        var altPrefixItem = collection[altPrefix];
                        if(altPrefixItem.match && text.match(me.core.string.regex(altPrefixItem.match))) {
                            defaultWord = altPrefix;
                            if(wordToInsert[0] === wordToInsert[0].toUpperCase()) {
                                defaultWord = defaultWord.charAt(0).toUpperCase() + defaultWord.slice(1);
                            }
                            wordToInsert = null;
                            break;
                        }
                    }
                }
                break;
            }
        }
        if(defaultWord && !wordToInsert) {
            var item = collection[defaultWord.toLowerCase()];
            if(item && item.replaceOnly) {
                defaultWord = null;
            }
        }
        if(wordToInsert) {
            words.splice(wordIndex, 0, wordToInsert);
        }
        else if (defaultWord) {
            words.splice(wordIndex, 0, defaultWord);
        }
    };
    me.removeFormatting = function (string) {
        string = string.replace(/\ kab-term-tooltip=".*?"/g, "");
        string = string.replace(/\ kab-term-heading=".*?"/g, "");
        string = string.replace(/\ class=".*?"/g, "");
        string = string.replace(/<\/?p>/g, "");
        string = string.replace(/<\/?span>/g, "");
        string = string.replace(/ and/g, ",");
        string = string.toLowerCase();
        return string;
    };
    me.removeDuplicates = function (wordsString, openChar, closeChar) {
        var parts = wordsString.split(me.core.string.regex("/(\\" + openChar + ".*?\\" + closeChar + ")"));
        for (var i = 0; i < parts.length - 1; i++) {
            var fragment = parts[i + 1];
            if (fragment.match(me.core.string.regex("/\\" + openChar + "\\d+\\" + closeChar))) {
                i++;
                continue;
            }
            if (fragment.startsWith(openChar) && fragment.endsWith(closeChar)) {
                var fragment = fragment.slice(1, -1);
                if (me.removeFormatting(parts[i]).includes(me.removeFormatting(fragment))) {
                    parts.splice(i + 1, 1);
                    i--;
                    continue;
                }
            }
        }
        wordsString = parts.join("");
        return wordsString;
    };
    me.fixSpelling = function(wordsString) {
        var spelling = me.json.spelling;
        if(spelling) {
            for(var incorrect in spelling) {
                var correct = spelling[incorrect];
                wordsString = wordsString.split(incorrect).join(correct);
            }
        }
        return wordsString;
    };
    me.format = function (wordsString, dict) {
        if (dict) {
            dict.map(function (item) {
                if ("enabled" in item && !item.enabled) {
                    return;
                }
                if (item.match) {
                    var checkInSplit = false;
                    var itemSplit = "\n";
                    if ("split" in item) {
                        itemSplit = me.core.string.regex(item.split);
                        checkInSplit = item.split.startsWith("/");
                    }
                    var itemJoin = itemSplit;
                    if ("join" in item) {
                        itemJoin = item.join;
                    }
                    wordsString = wordsString.split(itemSplit).map(function (selection) {
                        var inSplit = selection.match(itemSplit);
                        var matches = selection.match(me.core.string.regex(item.match));
                        if (matches && (inSplit || !checkInSplit)) {
                            if (item.prefix) {
                                selection = item.prefix + selection;
                            }
                            if (item.suffix) {
                                selection += item.suffix;
                            }
                            var find = item.find;
                            if (find) {
                                selection = selection.replace(me.core.string.regex(find), me.core.string.regex(item.replace));
                            }
                        }
                        return selection;
                    }).join(itemJoin);
                    return;
                }
                var find = item.find;
                if (find && (item.prefix || item.suffix)) {
                    wordsString = wordsString.split(me.core.string.regex(find)).join(item.replace);
                    if (item.prefix) {
                        wordsString = item.prefix + wordsString;
                    }
                    if (item.suffix) {
                        wordsString = wordsString + item.suffix;
                    }
                } else if (find) {
                    wordsString = wordsString.replace(me.core.string.regex(find), me.core.string.regex(item.replace));
                }
            });
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
        if (item.word) {
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
    me.modify = function (words, wordIndex, sourceLength, prefixWord, suffixWord, item, term, prefix, replacement, suffix, options, expansion) {
        words.splice(wordIndex, sourceLength);
        if(item.source) {
            term = item.source;
        }
        if (!options.doTranslation) {
            replacement = term;
        } else if (options.keepSource) {
            replacement = term + prefix + replacement + suffix;
        }
        var text = replacement;
        if (options.addStyles && (item.style || replacement !== term)) {
            replacement = me.applyStyles(term, item.style, replacement, options, expansion);
        }
        words.splice(wordIndex, 0, replacement);
        me.insert(words, wordIndex, me.json.prefix, item.prefix, prefixWord, text);
        me.insert(words, wordIndex+1, me.json.suffix, item.suffix, suffixWord, text);
    };
    me.applyStyles = function (term, styles, text, options, expansion) {
        var html = "";
        var phase = null, heading = null, tooltip = null;
        if (styles && styles.diagram && me.json.diagrams) {
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
            phase = styles.phase;
            if (styles && styles.heading && options.headings) {
                heading = styles.heading;
            }
            if (!options.keepSource && !expansion && options.doTranslation && term !== text) {
                tooltip = term;
            }
        } else if (!options.keepSource && !expansion) {
            phase = "none";
            if (term !== text) {
                tooltip = term;
            }
            if (styles && styles.heading && options.headings) {
                heading = styles.heading;
            }
        }
        if(phase) {
            html += "<span class=\"kab-term-phase kab-term-phase-" + phase + "\"";
        }
        if(tooltip) {
            html += " kab-term-tooltip=\"" + tooltip + "\"";
        }
        if(phase || tooltip || heading) {
            html += ">";
        }
        if(heading) {
            html += "<span class=\"kab-term-heading\">" + heading + "</span>";
        }
        if(phase && phase !== "none" && options.phaseNumbers) {
            html += "<span class=\"kab-term-phase-number kab-term-phase-number-" + phase + "\"></span>";
        }
        html += text;
        if(phase || tooltip || heading) {
            html += "</span>";
        }
        if (styles && styles.bold) {
            html += "</b>";
        }
        return html;
    };
    me.prepare = function(terms) {
        var result = new Map();
        for(var term in terms) {
            var info = terms[term];
            var words = term.split(" ");
            var key = words[0].toUpperCase();
            var lookup = result[key];
            if(!lookup) {
                lookup = new Map();
                result[key] = lookup;
                result[words[0]] = lookup;
            }
            lookup[term] = info;
        }
        for(var term in result) {
            var lookup = result[term];
            me.sortKeys(lookup);
        }
        me.sortKeys(result);
        return result;
    };
    me.sortKeys = function(dict) {
        var keys = Object.keys(dict);
        keys = keys.sort(function (source, target) {
            return target.length - source.length;
        });
        keys = keys.filter(function(key) {
            return !key.startsWith("!");
        });
        dict["*"] = keys;
    };
};