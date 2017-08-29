/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.init = function () {
        me.jsons = {};
        me.json = null;
        me.terms = null;
        me.diagrams = null;
        me.styles = null;
        me.searchTerms = [];
        me.content = null;
        me.language = "english";
    };
    me.setLanguage = function (callback, language) {
        language = language.toLowerCase();
        if(me.jsons[language]) {
            var json = me.jsons[language];
            var numTerms = 0;
            if (json.term) {
                numTerms = Object.keys(json.term).length;
            }
            if (callback) {
                callback(numTerms);
            }
        }
        else {
            me.core.json.load(function (json) {
                if (json) {
                    me.jsons[language] = json;
                    var numTerms = 0;
                    if (json.term) {
                        numTerms = Object.keys(json.term).length;
                    }
                    if (callback) {
                        callback(numTerms);
                    }
                }
            }, "kab.terms_" + language);
        }
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
            me.diagrams = {};
            me.styles = {};
            me.searchTerms = {};
            wordsString = me.send("kab.terms.fixSpelling", wordsString);
            wordsString = me.send("kab.terms.format", wordsString, me.json.pre);
            me.terms = me.send("kab.terms.prepare", me.json.term);
            me.styles = me.json.style;
            me.content = wordsString;
        }
        var terms = me.terms;
        if (terms) {
            wordsString = me.core.string.parseWords(function (words) {
                var wasPrefix = false;
                if(callback && me.json.options && me.json.options.splitPartial) {
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
                    if(!word) {
                        continue;
                    }
                    word = word.toUpperCase();
                    var termLookup = terms[word];
                    if(!termLookup) {
                        if(word.length > 2) {
                            term = terms["*"].find(function(term) {
                                return match(null, word, term);
                            });
                            if(term) {
                                termLookup = terms[term];
                            }
                        }
                        if(!termLookup) {
                            wasPrefix = false;
                            continue;
                        }
                        console.log("found ending word:" + word + " as: " + termLookup);
                    }
                    if(wasPrefix) {
                        wordIndex--;
                        wasPrefix = false;
                    }
                    var subTermNames = termLookup["*"];
                    if(!subTermNames) {
                        continue;
                    }
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
                        var overrideSource = item.source;
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
                                        text = parse(null, me.language, text, options);
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
                                expansion = parse(null, me.language, expansion, options);
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " (", expansion, ")", options, true);
                        }
                        else if (options.doTranslation && translation) {
                            if (!item.name && translation !== term) {
                                translation = parse(null, me.language, translation, duplicateOptions(options, {"addStyles": false}));
                            }
                            me.useTerm(item, term, translation);
                            if(upperCase) {
                                translation = translation.toUpperCase();
                            }
                            modify(words, wordIndex, span, prefixWord, suffixWord, item, source, " [", translation, "]", options);
                        }
                        else if(options.doTranslation && !options.keepSource && overrideSource) {
                            words.splice(wordIndex, span);
                            if(Array.isArray(overrideSource)) {
                                words.splice(wordIndex, 0, ...overrideSource);
                            }
                            else {
                                words.splice(wordIndex, 0, overrideSource);
                            }
                            wordIndex--;
                        }
                        else if (options.addStyles && item.style) {
                            if(item.source) {
                                me.useTerm(item, item.source, term);
                            }
                            me.useTerm(item, term, term);
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
            }
            callback(wordsString, me.searchTerms, me.json.termTableData);
            return;
        }
        return wordsString;
    };
    me.useTerm = function(item, source, translation) {
        if(!("search" in item) || item.search === true) {
            if(item.includePrefix) {
                translation = item.prefix + " " + translation;
            }
            var usedTerm = me.searchTerms[translation];
            if(!usedTerm) {
                usedTerm = me.searchTerms[translation] = {count:0};
            }
            usedTerm.count++;
            if(item.label) {
                usedTerm.source = item.label;
            }
            else {
                usedTerm.source = item.source ? item.source : source;
            }
            if(item.style) {
                usedTerm.heading = item.style.heading;
                usedTerm.phase = item.style.phase;
            }
        }
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
    me.modify = function (words, wordIndex, sourceLength, prefixWord, suffixWord, item, term, prefix, replacement, suffix, options, expansion) {
        words.splice(wordIndex, sourceLength);
        if(item.source) {
            term = item.source;
        }
        if(item.includePrefix && !options.keepSource) {
            replacement = item.prefix + " " + replacement;
        }
        if (!options.doTranslation) {
            replacement = term;
        } else if (options.keepSource) {
            replacement = term + prefix + replacement + suffix;
        }
        var text = replacement;
        var replacementWithStyles = replacement;
        if (options.addStyles && (item.style || replacement !== term)) {
            replacementWithStyles = me.applyStyles(term, item.style, replacement, options, expansion);
        }
        me.replaceDuplicate(words, wordIndex, replacement);
        words.splice(wordIndex, 0, replacementWithStyles);
        if(!item.includePrefix) {
            me.insert(words, wordIndex, me.json.prefix, item.prefix, prefixWord, text);
        }
        me.insert(words, wordIndex+1, me.json.suffix, item.suffix, suffixWord, text);
    };
    me.findNext = function(words, wordIndex, find) {
        
    };
    me.replaceDuplicate = function(words, wordIndex, replacement) {
        var collectIndex = wordIndex+1;
        var next = words[collectIndex++];
        if(next === "(" || next === "[") {
            var duplicate = "";
            for(;;) {
                if(collectIndex > words.length) {
                    break;
                }
                var next = words[collectIndex++];
                if(next === ")" || next === "]") {
                    if(replacement.toLowerCase() === duplicate.toLowerCase()) {
                        words.splice(wordIndex+1, collectIndex - wordIndex);
                    }
                    break;
                }
                if(duplicate) {
                    duplicate += " " + next;
                }
                else {
                    duplicate = next;
                }
            }
        }
    };
    me.applyStyles = function (term, styles, text, options, expansion) {
        var html = "";
        var phase = null, heading = null, tooltip = null, short = null, long = null;
        if(typeof styles === "string") {
            if(me.styles) {
                styles = me.styles[styles];
            }
            else {
                styles = null;
            }
        }
        if (styles && styles.diagram && me.json.diagrams) {
            if (!me.diagrams
            [styles.diagram]) {
                var diagram = me.json.diagrams[styles.diagram];
                html += "<span class=\"kab-terms-" + diagram.class + "\" " + diagram.attributes + ">";
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
        if(styles && styles.short) {
            short = styles.short;
        }
        if(styles && styles.long) {
            long = styles.long;
        }
        if(styles && styles.tooltip) {
            tooltip = styles.tooltip;
        }
        if(phase) {
            html += "<span class=\"kab-terms-phase-inline kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-outline\"";
        }
        if(phase || short || long) {
            html += " kab-terms-toast";
        }
        if(tooltip) {
            html += " kab-terms-tooltip=\"" + tooltip + "\"";
        }
        if(phase || tooltip || heading || short || long) {
            html += ">";
        }
        if(phase && phase !== "none" && options.phaseNumbers && me.json.phaseNumber) {
            var phaseNumber = me.json.phaseNumber[phase];
            if(phaseNumber) {
                html += "<span class=\"kab-terms-phase-number kab-terms-phase-number-" + phase + " kab-terms-" + me.language + "\">" + phaseNumber + "</span>";
            }
        }
        if(heading) {
            html += "<span class=\"kab-terms-heading kab-terms-" + me.language + "\">" + heading + "</span>";
        }
        if(phase || short || long) {
            if(phase === "none") {
                phase = "root";
            }
            html += "<span class=\"kab-terms-description-box kab-terms-phase-" + phase + "-border\">";
            if(!short) {
                short = "";
            }
            html += "<span class=\"kab-terms-short kab-terms-" + me.language + " kab-terms-phase-" + phase + " kab-terms-phase-" + phase + "-underline\"><b>" + text + ":</b> " + short + "</span>";
            if(long) {
                html += "<span class=\"kab-terms-long\">" + long + "</span>";
            }
            html+= "</span>";
        }
        html += text;
        if(phase || tooltip || heading || short || long) {
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