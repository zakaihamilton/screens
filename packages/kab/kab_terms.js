/*
 @author Zakai Hamilton
 @component KabTerms
 */

package.kab.terms = function KabTerms(me) {
    me.init = function () {
        me.json = null;
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
            wordsString = me.send("kab.terms.fixSpelling", wordsString);
            wordsString = me.send("kab.terms.format", wordsString);
        }
        var prefixes = me.json.prefixes;
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
                        var prefixWord = null;
                        var item = terms[term];
                        var termWords = term.split(" ");
                        var numTermWords = termWords.length;
                        var collectedWords = "";
                        for (var termWordIndex = 0; termWordIndex < numTermWords; termWordIndex++) {
                            if (wordIndex + termWordIndex >= words.length) {
                                break;
                            }
                            var word = words[wordIndex + termWordIndex];
                            var matchingTerm = terms[word];
                            var prefixTerm = prefixes ? word.toLowerCase() in prefixes : false;
                            if (prefixTerm || matchingTerm) {
                                if (prefixTerm || matchingTerm.ignore) {
                                    if (prefixTerm || collectedWords) {
                                        if(prefixTerm) {
                                            prefixWord = word;
                                        }
                                        numTermWords++;
                                        continue;
                                    }
                                }
                            }
                            if (collectedWords) {
                                collectedWords += " " + word;
                            } else {
                                collectedWords = word;
                            }
                        }
                        if (me.match(item, term, collectedWords)) {
                            var expansion = item.expansion;
                            if (expansion) {
                                expansion = [].concat(expansion);
                                expansion = expansion.map(function (item) {
                                    if(item.includes(term)) {
                                        return item;
                                    }
                                    else {
                                        return me.parse(null, item, options);
                                    }
                                });
                                if (expansion.length > 1) {
                                    expansion = expansion.slice(0, -1).join(", ") + " and " + expansion.slice(-1).toString();
                                } else {
                                    expansion = expansion.slice(-1).toString();
                                }
                                words.splice(wordIndex, numTermWords);
                                var text = me.modify(words, wordIndex, item, collectedWords, " (", expansion, ")", options, true);
                                me.prefix(words, wordIndex, item, prefixWord, text, options);
                            }
                            var translation = item.translation;
                            if (translation) {
                                if (!item.name) {
                                    translation = me.parse(null, translation, me.duplicateOptions(options, {"addStyles": false}));
                                }
                                words.splice(wordIndex, numTermWords);
                                var text = me.modify(words, wordIndex, item, collectedWords, " [", translation, "]", options);
                                me.prefix(words, wordIndex, item, prefixWord, text, options);
                            }
                            if (options.addStyles && !translation && !expansion) {
                                words.splice(wordIndex, numTermWords);
                                var text = me.modify(words, wordIndex, item, collectedWords, "", collectedWords, "", me.duplicateOptions(options, {"keepSource": false}));
                                me.prefix(words, wordIndex, item, prefixWord, text, options);
                            }
                            break;
                        }
                    }
                }
            }, wordsString);
        }
        if (callback) {
            if (me.language !== "debug") {
                wordsString = me.send("kab.terms.removeDuplicates", wordsString, "(", ")");
                wordsString = me.send("kab.terms.removeDuplicates", wordsString, "[", "]");
                wordsString = me.send("kab.terms.cleanText", wordsString);
            }
            callback(wordsString);
            return;
        }
        return wordsString;
    };
    me.prefix = function(words, wordIndex, item, prefixWord, text, options) {
        var prefixInsert = item.prefix;
        if(!prefixInsert && me.json.prefixes && prefixWord) {
            var prefix = null;
            for(prefix in me.json.prefixes) {
                var prefixItem = me.json.prefixes[prefix];
                if(prefix === prefixWord.toLowerCase() && prefixItem.match) {
                    for(var altPrefix in me.json.prefixes) {
                        var altPrefixItem = me.json.prefixes[altPrefix];
                        if(altPrefixItem.match && text.match(me.regex(altPrefixItem.match))) {
                            prefixInsert = altPrefix;
                            if(prefixWord[0] === prefixWord[0].toUpperCase()) {
                                prefixInsert = prefixInsert.charAt(0).toUpperCase() + prefixInsert.slice(1);
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }
        if (prefixInsert) {
            words.splice(wordIndex, 0, prefixInsert);
        }
        else if(prefixWord) {
            words.splice(wordIndex, 0, prefixWord);
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
        var parts = wordsString.split(me.regex("/(\\" + openChar + ".*?\\" + closeChar + ")"));
        for (var i = 0; i < parts.length - 1; i++) {
            var fragment = parts[i + 1];
            if (fragment.match(me.regex("/\\" + openChar + "\\d+\\" + closeChar))) {
                i++;
                continue;
            }
            var checkFragment = false;
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
    me.cleanText = function (wordsString) {
        wordsString = wordsString.replace(" .", ".");
        wordsString = wordsString.replace(" ,", ",");
        return wordsString;
    };
    me.regex = function (string) {
        if (string.startsWith("/")) {
            string = string.slice(1);
            string = new RegExp(string, 'g');
        }
        return string;
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
    me.format = function (wordsString) {
        var format = me.json.format;
        if (format) {
            format.map(function (item) {
                if ("enabled" in item && !item.enabled) {
                    return;
                }
                if (item.match) {
                    var checkInSplit = false;
                    var itemSplit = "\n";
                    if ("split" in item) {
                        itemSplit = me.regex(item.split);
                        checkInSplit = true;
                    }
                    var itemJoin = "\n";
                    if ("join" in item) {
                        itemJoin = item.join;
                    }
                    wordsString = wordsString.split(itemSplit).map(function (selection) {
                        var inSplit = selection.match(itemSplit);
                        var matches = selection.match(me.regex(item.match));
                        if (matches && (inSplit || !checkInSplit)) {
                            if (item.prefix) {
                                selection = item.prefix + selection;
                            }
                            if (item.suffix) {
                                selection += item.suffix;
                            }
                        }
                        return selection;
                    }).join(itemJoin);
                }
                var find = item.find;
                if (find && (item.prefix || item.suffix)) {
                    wordsString = wordsString.split(me.regex(find)).join(item.replace);
                    if (item.prefix) {
                        wordsString = item.prefix + wordsString;
                    }
                    if (item.suffix) {
                        wordsString = wordsString + item.suffix;
                    }
                } else if (find) {
                    wordsString = wordsString.replace(me.regex(find), me.regex(item.replace));
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
        target = me.toCase(item, target);
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
            return target.includes(source);
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
    me.modify = function (words, wordIndex, item, term, prefix, replacement, suffix, options, expansion) {
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
        return text;
    };
    me.applyStyles = function (term, styles, text, options, expansion) {
        var html = "";
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
            html += "<span class=\"kab-term-phase-" + styles.phase + "\"";
            if (styles && styles.heading && options.headings) {
                html += " kab-term-heading=\"" + styles.heading + "\"";
            }
            if (!options.keepSource && !expansion && options.doTranslation && term !== text) {
                html += " kab-term-tooltip=\"" + term + "\"";
            }
            html += ">" + text + "</span>";
        } else if (!options.keepSource && !expansion) {
            html += "<span class=\"kab-term-phase-none\"";
            if (term !== text) {
                html += " kab-term-tooltip=\"" + term + "\"";
            }
            if (styles && styles.heading && options.headings) {
                html += " kab-term-heading=\"" + styles.heading + "\"";
            }
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