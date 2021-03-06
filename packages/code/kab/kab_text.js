/*
 @author Zakai Hamilton
 @component KabText
 */

screens.kab.text = function KabText(me, { core, kab }) {
    me.splitWords = function (session, wordsString) {
        wordsString = core.string.parseWords(function (words) {
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
    me.parseSingle = function (session, parentInstance, wordsString, textOnly) {
        var prefix = session.json.prefix;
        var suffix = session.json.suffix;
        var ignore = session.json.ignore;
        var wordStyle = session.json.options.wordStyle;
        if (!wordStyle) {
            wordStyle = "whole";
        }
        try {
            wordsString = wordsString.replace(/<[/]?script[^>]*>/g, "");
            wordsString = wordsString.replace(/<[/]?iframe[^>]*>/g, "");
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
        if (!session.options.parentheses) {
            wordsString = wordsString.replace(/\(([^()]+|[^(]+\([^)]*\)[^()]*)\)/g, " ");
        }
        if (!session.options.brackets) {
            wordsString = wordsString.replace(/\[([^[\]]+|[^[]+\[[^\]]*\][^[\]]*)\]/g, " ");
        }
        wordsString = core.string.parseWords(function (words) {
            var wasPrefix = false;
            for (var wordIndex = 0; wordIndex < words.length; wordIndex++) {
                let word = words[wordIndex];
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
                        let match = core.string.match;
                        term = session.terms["*"].find(function (term) {
                            return match(word, term, wordStyle);
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
                    var prefixWord = null, suffixWord = null;
                    var numTermWords = item.numWords ? item.numWords : term.split(" ").length;
                    if (item.suffix) {
                        numTermWords++;
                    }
                    var collectedWords = "";
                    for (var termWordIndex = 0; termWordIndex < numTermWords; termWordIndex++) {
                        if (wordIndex + termWordIndex >= words.length) {
                            break;
                        }
                        let word = words[wordIndex + termWordIndex];
                        if (!word) {
                            numTermWords++;
                            continue;
                        }
                        if (word === ",") {
                            numTermWords++;
                            continue;
                        }
                        var prefixTerm = prefix ? word.toLowerCase() in prefix && !termWordIndex : false;
                        var suffixTerm = suffix ? word.toLowerCase() in suffix : false;
                        var ignoreTerm = ignore ? ignore.includes(word) && !item.fixed : false;
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
                    var upperCase = false;
                    if (item && item.word) {
                        wordStyle = item.word;
                    }
                    let match = term;
                    if (!core.string.match(collectedWords, term, wordStyle)) {
                        if (!("case" in item) || !item.case) {
                            match = term.toUpperCase();
                            if (!item.case) {
                                if (core.string.match(collectedWords.toUpperCase(), match, wordStyle)) {
                                    term = collectedWords;
                                }
                                else {
                                    continue;
                                }
                            }
                            else if (!core.string.match(collectedWords, match, wordStyle)) {
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
                        parent: parentInstance,
                        source: core.string.middleLetters(collectedWords, match),
                        term,
                        target: item.source ? item.source : term,
                        upperCase: upperCase,
                        prefixWord: prefixWord,
                        suffixWord: suffixWord,
                        words: words,
                        wordIndex: wordIndex,
                        span: numTermWords,
                        prefixLetters: core.string.prefixLetters(collectedWords, match),
                        suffixLetters: core.string.suffixLetters(collectedWords, match),
                        textOnly: textOnly
                    };
                    match = me.handleInstance(session, instance);
                    wordIndex = instance.wordIndex;
                    if (match) {
                        break;
                    }
                }
            }
        }, wordsString);
        return wordsString;
    };
    me.clean = function (string) {
        return string.replace(/<[/]?[^>]+>/g, "").trim();
    };
    me.hash = function (string) {
        var clean = me.clean(string);
        var hash = core.string.hash(clean);
        return hash;
    };
    me.parse = async function (language, wordsString, options) {
        var diagrams = [];
        if (!wordsString) {
            wordsString = "";
        }
        var globalJson = await kab.data.load(language);
        if (!globalJson) {
            return { text: wordsString };
        }
        core.message.send("kab.term.clear");
        if (wordsString.includes("\n")) {
            wordsString = core.message.send("kab.format.process", wordsString, globalJson.pre);
        }
        var lines = wordsString.split("\n");
        var languages = {};
        for (let language of ["english", "hebrew"]) {
            let json = await kab.data.load(language);
            let terms = core.message.send("kab.text.prepare", json, json.term, options);
            languages[language] = {
                json,
                terms
            };
        }
        lines = lines.map(async line => {
            var language = core.string.language(me.clean(line));
            let json = languages[language].json;
            let terms = languages[language].terms;
            line = core.message.send("kab.format.replace", line, json.replace);
            var hash = me.hash(line);
            var session = {
                hash,
                line,
                language,
                options,
                terms,
                json
            };
            line = me.splitWords(session, line);
            session.text = wordsString;
            if (session.terms) {
                line = me.parseSingle(session, null, line);
            }
            line = core.message.send("kab.format.process", line, json.post);
            if (line === "<br>") {
                return line;
            }
            if (options.showHighlights) {
                line = await kab.highlight.line(session, line);
            }
            if (session.diagrams) {
                diagrams.push(...session.diagrams);
            }
            return line;
        });
        lines = await Promise.all(lines);
        lines = lines.map(line => {
            let matches = line.match(/<((?:\\.|[^>\\])*)>+/g);
            if (matches) {
                for (let match of matches) {
                    let matches = match.match(/"((?:\\.|[^"\\])*)"+/g);
                    if (matches) {
                        for (let match of matches) {
                            line = line.replace(match, match.replace(/\[SPAN\]/g, ""));
                        }
                    }
                }
            }
            line = line.replace(/\[SPAN\]/g, "</span><span>");
            return line;
        });
        lines = lines.filter(Boolean);
        diagrams = Array.from(new Set(diagrams));
        var info = { text: lines.join("\n"), terms: kab.term.terms, data: globalJson.data, diagrams };
        return info;
    };
    me.handleInstance = function (session, instance) {
        var match = false;
        var modify = me.modify;
        var parseSingle = me.parseSingle;
        var term = instance.term;
        var expansion = instance.item.expansion;
        var abridged = instance.item.abridged;
        var translation = instance.item.translation;
        var explanation = instance.item.explanation;
        var source = instance.item.source;
        var stam = instance.item.stam;
        var context = instance.item.context;
        var lastFieldSeparator = "";
        if (session.json.data.lastFieldSeparator) {
            lastFieldSeparator = session.json.data.lastFieldSeparator;
        }
        if (!session.options.doExplanation) {
            explanation = null;
        }
        if (!session.options.abridged) {
            abridged = null;
        }
        if (!session.options.doTranslation && !abridged) {
            if (session.options.doExplanation && !explanation) {
                explanation = translation;
            }
            translation = null;
        }
        if (context) {
            var contextMatch = true;
            if (typeof context === "string") {
                if (!session.text.toLowerCase().includes(context.toLowerCase())) {
                    contextMatch = false;
                }
            } else if (Array.isArray(context)) {
                context.map(function (entry) {
                    if (!session.text.toLowerCase().includes(entry.toLowerCase())) {
                        contextMatch = false;
                    }
                });
            }
            if (!contextMatch) {
                return;
            }
        }
        if (expansion || abridged) {
            var field = expansion;
            if (abridged) {
                field = abridged;
            }
            if (Array.isArray(field)) {
                field = field.map(function (text, index) {
                    if (index === field.length - 1 && field.length > 1) {
                        text = lastFieldSeparator + text;
                    }
                    if (!text.includes(instance.target)) {
                        text = parseSingle(session, instance, text);
                    }
                    return text;
                });
                if (field.length > 1) {
                    field = field.slice(0, -1).join(", ") + field.slice(-1).toString();
                } else {
                    field = field.slice(-1).toString();
                }
            } else {
                field = parseSingle(session, instance, field);
            }
            modify(session, instance, " (", field, null, ")", true, session.options.keepSource);
            match = true;
        } else if (translation || explanation) {
            if (translation) {
                if (!instance.item.fixed && translation !== instance.target && term.toLowerCase() !== translation.toLowerCase()) {
                    translation = parseSingle(session, instance, translation, true);
                }
            }
            kab.term.setTerm(session.options, session.json.style, instance.item, null, translation, explanation);
            if (translation && instance.upperCase) {
                translation = translation.toUpperCase();
            }
            if (explanation && instance.upperCase) {
                explanation = explanation.toUpperCase();
            }
            modify(session, instance, " [", translation, explanation, "]", false, session.options.keepSource || session.json.options.keepExpandedSource);
            match = true;
        } else if (session.options.addStyles && instance.item.style) {
            kab.term.setTerm(session.options, session.json.style, instance.item);
            modify(session, instance, "", source ? source : instance.source, null, "", false, false);
            match = true;
        } else if (source) {
            if (typeof stam === "undefined" || stam) {
                if (Array.isArray(source)) {
                    source = source.map(text => kab.style.formatHebrewText(text));
                }
                else {
                    source = kab.style.formatHebrewText(source);
                }
            }
            instance.words.splice(instance.wordIndex, instance.span);
            if (Array.isArray(source)) {
                instance.words.splice(instance.wordIndex, 0, ...source);
                instance.wordIndex -= source.length;
            } else {
                instance.words.splice(instance.wordIndex, 0, source);
                instance.wordIndex--;
            }
        }
        return match;
    };
    me.modify = function (session, instance, prefix, translation, explanation, suffix, expansion, keepSource) {
        var term = instance.target;
        if (!translation) {
            translation = "";
        }
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
        if (instance.item.includePrefix && !keepSource && !session.options.ignorePrefix) {
            replacement = instance.item.prefix + " " + replacement;
        }
        if (instance.item.quote) {
            replacement = "\"" + replacement + "\"";
        }
        if (!session.options.doTranslation && !session.options.doExplanation) {
            replacement = term;
        } else if (keepSource && !core.string.caselessCompare(term, replacement)) {
            replacement = term + prefix + replacement + suffix;
        }
        kab.format.replaceDuplicate(session, instance, replacement);
        var prefixLetters = instance.prefixLetters;
        if (!prefixLetters && instance.parent) {
            prefixLetters = instance.prefixLetters = instance.parent.prefixLetters;
            instance.parent.prefixLetters = null;
        }
        var text = replacement;
        var replacementWithStyles = replacement;
        var applyStyles = false;
        if (!instance.textOnly && session.options.addStyles) {
            applyStyles = true;
        }
        if (applyStyles) {
            replacementWithStyles = kab.style.process(session, instance, replacement, expansion);
        }
        else if (prefixLetters) {
            replacementWithStyles = prefixLetters + replacementWithStyles;
        }
        var insert = replacementWithStyles;
        if (instance.suffixLetters) {
            insert = "<span style=\"white-space: nowrap\">" + replacementWithStyles + instance.suffixLetters + "</span>";
        }
        instance.words.splice(instance.wordIndex, 0, insert);
        if (!instance.item.includePrefix && !session.options.ignorePrefix) {
            kab.format.insert(instance.words, instance.wordIndex, session.json.prefix, instance.item.prefix, instance.prefixWord, text);
        }
        kab.format.insert(instance.words, instance.wordIndex + 1, session.json.suffix, instance.item.suffix, instance.suffixWord, text);
    };
    me.prepare = function (json, terms, options) {
        var result = new Map();
        if (!terms) {
            return null;
        }
        var { associated } = json;
        if (associated) {
            for (let type in associated) {
                let set = associated[type];
                if (Array.isArray(set)) {
                    for (let term of set) {
                        let item = terms.find(item => item.term === term);
                        if (item) {
                            if (!item.associated) {
                                item.associated = {};
                            }
                            if (!item.associated[type]) {
                                item.associated[type] = [];
                            }
                            item.associated[type].push(...set);
                            kab.term.setTerm(options, json.style, item, null, null, null, false);
                        }
                    }
                }
            }
        }
        for (let item of terms) {
            let words = item.term.split(" ");
            let key = words[0].toUpperCase();
            let lookup = result[key];
            if (item.defaultTerm) {
                kab.term.setTerm(options, json.style, item, null, null, null, false);
            }
            if (!lookup) {
                lookup = new Map();
                result[key] = lookup;
                result[words[0]] = lookup;
            }
            lookup[item.term] = item;
        }
        for (let term in result) {
            let lookup = result[term];
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
    return "client";
};