/*
 @author Zakai Hamilton
 @component KabLetters
 */

screens.kab.letters = function KabLetters(me) {
    me.numerologyTable = {
        "א": 1,
        "ב": 2,
        "ג": 3,
        "ד": 4,
        "ה": 5,
        "ו": 6,
        "ז": 7,
        "ח": 8,
        "ט": 9,
        "י": 10,
        "כ": 20,
        "ל": 30,
        "מ": 40,
        "נ": 50,
        "ס": 60,
        "ע": 70,
        "פ": 80,
        "צ": 90,
        "ק": 100,
        "ר": 200,
        "ש": 300,
        "ת": 400,
        "ך": 500,
        "ם": 600,
        "ן": 700,
        "ף": 800,
        "ץ": 900
    };
    me.endingLetters = {
        "ך": "כ",
        "ם": "מ",
        "ן": "נ",
        "ף": "פ",
        "ץ": "צ"
    };
    me.pronunciationTable = {
        "hebrew": {
            "א": "אלף",
            "ב": "בית",
            "ג": "גימל",
            "ד": "דלת",
            "ה": "הי",
            "ו": "וו",
            "ז": "זין",
            "ח": "חית",
            "ט": "טית",
            "י": "יוד",
            "כ": "כף",
            "ל": "למד",
            "מ": "מם",
            "נ": "נון",
            "ס": "סמך",
            "ע": "עין",
            "פ": "פי",
            "צ": "צדי",
            "ק": "קוף",
            "ר": "ריש",
            "ש": "שין",
            "ת": "תו",
            "ך": "כף סופית",
            "ם": "מם סופית",
            "ן": "נון סופית",
            "ף": "פי סופית",
            "ץ": "צדי סופית"
        },
        "english": {
            "א": "Alef",
            "ב": "Bet",
            "ג": "Gimel",
            "ד": "Dalet",
            "ה": "Hey",
            "ו": "Vav",
            "ז": "Zayin",
            "ח": "Chet",
            "ט": "Tet",
            "י": "Yod",
            "כ": "Kaf",
            "ל": "Lamed",
            "מ": "Mem",
            "נ": "Nun",
            "ס": "Samech",
            "ע": "Ayin",
            "פ": "Pay",
            "צ": "Tsade",
            "ק": "Kuf",
            "ר": "Resh",
            "ש": "Shin",
            "ת": "Tav",
            "ך": "Chaf Sofit",
            "ם": "Mem Sofit",
            "ן": "Nun Sofit",
            "ף": "Pay Sofit",
            "ץ": "Tsade Sofit"
        }
    };
    me.source = {
        set: function (object, value) {
            var window = me.widget.window.get(object);
            window.kab_info = Object.assign({}, value);
            var sources = window.kab_info.sources;
            for (var source of sources) {
                source.letters = me.clean(source.verse);
            }
        }
    };
    me.clean = function (string) {
        return string.replace(/[^א-ת]/g, "");
    };
    me.letters = function (callback, object) {
        var window = me.widget.window.get(object);
        var sources = window.kab_info.sources;
        var sourceCount = Object.keys(sources).length;
        var columnCount = parseInt(window.kab_info.columnCount);
        var columnIndex = parseInt(window.kab_info.columnIndex);
        if (!columnIndex) {
            columnIndex = 1;
        }
        var language = window.kab_info.language;
        if(language) {
            language = language.toLowerCase();
        }
        var endingLetters = window.kab_info.endingLetters;
        var rowIndex = parseInt(window.kab_info.rowIndex);
        if (!rowIndex) {
            rowIndex = 0;
        }
        var gridColumnCount = columnCount * (sourceCount + 1);
        var maxLength = 0, source = null, letters = null, info = null, number = 0;
        var pronunciation = null;
        var row = 0, column = 0;
        for (source of sources) {
            letters = source.letters;
            if (maxLength < letters.length) {
                maxLength = letters.length;
            }
        }
        for (source of sources) {
            letters = source.letters;
            if (!source.offset) {
                source.offset = 0;
            }
            if (source.reverse) {
                letters = letters.split("").reverse().join("");
            }
            var sum = 0;
            for (var letterIndex = 0; letterIndex < letters.length; letterIndex++) {
                var letter = letters[letterIndex];
                if (!endingLetters) {
                    var matchingLetter = me.endingLetters[letter];
                    if (matchingLetter) {
                        letter = matchingLetter;
                    }
                }
                row = 0;
                column = 0;
                if (window.kab_info.sequence) {
                    row = rowIndex + source.offset + 1;
                    column = maxLength - letterIndex;
                    if (window.kab_info.sum && window.kab_info.sum.enabled) {
                        column++;
                    }
                }
                else {
                    row = rowIndex + parseInt(letterIndex / columnCount) + 1;
                    column = columnIndex + (gridColumnCount - (sourceCount + 1)) - (((letterIndex % columnCount) * (sourceCount + 1)) - source.offset) + 1;
                }
                number = me.numerologyTable[letter];
                if(language) {
                    var languageTable = me.pronunciationTable[language];
                    if(languageTable) {
                        pronunciation = languageTable[letter];
                    }
                }
                sum += number;
                info = { row, column, source, text: letter, number, pronunciation };
                if (callback) {
                    callback(info);
                }
            }
            if (window.kab_info.sum && window.kab_info.sequence && window.kab_info.sum.enabled) {
                row = rowIndex + source.offset + 1;
                info = { row, column: 1, source: window.kab_info.sum, text: source.verse, number: sum };
                if (callback) {
                    callback(info);
                }
            }
        }
    };
    me.text = {
        get: function (object) {
            var values = [];
            me.letters(info => {
                values.push([
                    info.row,
                    info.column,
                    info.text,
                    info.source.backgroundColor,
                    info.source.borderColor,
                    info.source.borderWidth
                ]);
            }, object);
            return values;
        }
    };
    me.numerology = {
        get: function (object) {
            var values = [];
            me.letters(info => {
                values.push([info.row, info.column, info.number]);
            }, object);
            return values;
        }
    };
    me.pronunciation = {
        get: function (object) {
            var values = [];
            me.letters(info => {
                values.push([info.row, info.column, info.pronunciation]);
            }, object);
            return values;
        }
    };
};
