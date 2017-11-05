/*
 @author Zakai Hamilton
 @component KabFormat
 */

package.kab.format = function KabFormat(me) {
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
                        itemSplit = me.package.core.string.regex(item.split);
                        checkInSplit = item.split.startsWith("/");
                    }
                    var itemJoin = itemSplit;
                    if ("join" in item) {
                        itemJoin = item.join;
                    }
                    wordsString = wordsString.split(itemSplit).map(function (selection) {
                        var inSplit = selection.match(itemSplit);
                        var matches = selection.match(me.package.core.string.regex(item.match));
                        if (matches && (inSplit || !checkInSplit)) {
                            if (item.prefix) {
                                selection = item.prefix + selection;
                            }
                            if (item.suffix) {
                                selection += item.suffix;
                            }
                            var find = item.find;
                            if (find) {
                                selection = selection.replace(me.package.core.string.regex(find), me.package.core.string.regex(item.replace));
                            }
                        }
                        return selection;
                    }).join(itemJoin);
                    return;
                }
                var find = item.find;
                if (find && (item.prefix || item.suffix)) {
                    wordsString = wordsString.split(me.package.core.string.regex(find)).join(item.replace);
                    if (item.prefix) {
                        wordsString = item.prefix + wordsString;
                    }
                    if (item.suffix) {
                        wordsString = wordsString + item.suffix;
                    }
                } else if (find) {
                    wordsString = wordsString.replace(me.package.core.string.regex(find), me.package.core.string.regex(item.replace));
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
                        if (altPrefixItem.match && text.match(me.package.core.string.regex(altPrefixItem.match))) {
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
        if (wordToInsert) {
            words.splice(wordIndex, 0, wordToInsert);
        } else if (defaultWord) {
            words.splice(wordIndex, 0, defaultWord);
        }
    };
    me.spelling = function (wordsString, spelling) {
        if (spelling) {
            for (var incorrect in spelling) {
                var correct = spelling[incorrect];
                wordsString = wordsString.split(incorrect).join(correct);
            }
        }
        return wordsString;
    };
    me.replaceDuplicate = function (session, instance, replacement) {
        var words = instance.words;
        var wordIndex = instance.wordIndex;
        var collectIndex = wordIndex + 1;
        var next = words[collectIndex++];
        if (next === "(" || next === "[") {
            var duplicate = "";
            for (; ; ) {
                if (collectIndex > words.length) {
                    break;
                }
                var next = words[collectIndex++];
                if (next === ")" || next === "]") {
                    var addStyles = session.options.addStyles;
                    session.options.addStyles = false;
                    duplicate = me.package.kab.text.parseSingle(session, duplicate, instance.depth + 1);
                    duplicate = duplicate.replace(/“/g, "");
                    duplicate = duplicate.replace(/”/g, "");
                    duplicate = duplicate.toLowerCase();
                    session.options.addStyles = addStyles;
                    if (replacement.toLowerCase().includes(duplicate)) {
                        words.splice(wordIndex + 1, collectIndex - wordIndex);
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
