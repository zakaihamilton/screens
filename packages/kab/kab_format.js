/*
 @author Zakai Hamilton
 @component MenuContext
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
        if (wordToInsert) {
            words.splice(wordIndex, 0, wordToInsert);
        } else if (defaultWord) {
            words.splice(wordIndex, 0, defaultWord);
        }
    };
};
