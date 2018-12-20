/*
 @author Zakai Hamilton
 @component KabFormat
 */

screens.kab.format = function KabFormat(me) {
    me.process = function (wordsString, dict) {
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
                        selection = selection.trim();
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
    me.insert = function (words, wordIndex, collection, defaultWord, wordToInsert, text) {
        if (collection && wordToInsert) {
            for (var itemName in collection) {
                var item = collection[itemName];
                if (!item.match) {
                    continue;
                }
                if (itemName !== wordToInsert.toLowerCase()) {
                    continue;
                }
                if (!defaultWord) {
                    for (var altPrefix in collection) {
                        var altPrefixItem = collection[altPrefix];
                        if (altPrefixItem.match && text.match(me.core.string.regex(altPrefixItem.match))) {
                            defaultWord = altPrefix;
                            if (wordToInsert[0] === wordToInsert[0].toUpperCase()) {
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
        if (defaultWord && !wordToInsert) {
            var item = collection[defaultWord.toLowerCase()];
            if (item && item.replaceOnly) {
                defaultWord = null;
            }
        }
        if (defaultWord) {
            words.splice(wordIndex, 0, defaultWord);
        }
        else if (wordToInsert) {
            words.splice(wordIndex, 0, wordToInsert);
        }
    };
    me.replace = function (wordsString, replacements) {
        if (replacements) {
            for (var groupName in replacements) {
                var groupItems = replacements[groupName];
                for (var from in groupItems) {
                    var to = groupItems[from];
                    wordsString = wordsString.split(from).join(to);
                }
            }
        }
        return wordsString;
    };
    me.replaceDuplicate = function (session, instance, replacement) {
        var words = instance.words;
        var wordIndex = instance.wordIndex;
        var collectIndex = wordIndex;
        var next = words[collectIndex++];
        var wordOffset = 0;
        if (next !== "(" && next !== "[") {
            next = words[collectIndex++];
            wordOffset++;
        }
        if (next === "(" || next === "[") {
            var duplicate = "";
            for (; ;) {
                if (collectIndex > words.length) {
                    break;
                }
                var next = words[collectIndex++];
                if (next === ")" || next === "]") {
                    var addStyles = session.options.addStyles;
                    session.options.addStyles = false;
                    duplicate = me.kab.text.parseSingle(session, instance, duplicate, instance.depth + 1);
                    duplicate = duplicate.replace(/“/g, "");
                    duplicate = duplicate.replace(/-/g, " ");
                    duplicate = duplicate.replace(/”/g, "");
                    duplicate = duplicate.toLowerCase();
                    replacement = replacement.toLowerCase();
                    session.options.addStyles = addStyles;
                    if (replacement.includes(duplicate)) {
                        words.splice(wordIndex + wordOffset, collectIndex - wordIndex);
                    }
                    break;
                }
                if (duplicate) {
                    duplicate += " " + next;
                } else {
                    duplicate = next;
                }
            }
        }
    };
};
