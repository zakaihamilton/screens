/*
 @author Zakai Hamilton
 @component CoreString
 */

screens.core.string = function CoreString(me) {
    me.title = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };
    me.delimiters = function () {
        var delimiters = [
            "\n", ";", ":", ".", ",", "—", "–", "-", "(", ")", "[", "]", "{", "}", "+", "<", ">", "?", "/", "\\", "”", "“", "!", "\"", "…", "'", "‘", "’", "\x09"
        ];
        return delimiters;
    };
    me.hasDelimiter = function (string) {
        var delimiters = me.delimiters();
        var result = false;
        for (var index = 0; index < delimiters.length - 1; index++) {
            var delimiter = delimiters[index];
            if (string.includes(delimiter)) {
                result = true;
                break;
            }
        }
        return result;
    };
    me.unparseWords = function (string) {
        var delimiters = me.delimiters();
        for (let index = 0; index < delimiters.length; index++) {
            let delimiter = delimiters[index];
            string = string.split(" " + delimiter + " ").join(delimiter);
        }
        return string;
    };
    me.parseWords = function (callback, string) {
        var delimiters = me.delimiters();
        for (let index = 0; index < delimiters.length; index++) {
            let delimiter = delimiters[index];
            string = string.split(delimiter).join(" " + delimiter + " ");
        }
        var words = string.split(" ");
        callback(words);
        string = words.join(" ");
        for (let index = 0; index < delimiters.length; index++) {
            let delimiter = delimiters[index];
            string = string.split(" " + delimiter + " ").join(delimiter);
        }
        return string;
    };
    me.nextWord = function (string) {
        var nextWord = "";
        me.core.string.parseWords(function (words) {
            if (words.length > 0) {
                nextWord = words[0];
            }
        }, string);
        return nextWord;
    };
    me.direction = function (string) {
        if (!string) {
            return "ltr";
        }
        var position = string.search(/[A-Za-z]/);
        if (position >= 0) {
            return "ltr";
        }
        return "rtl";
    };
    me.language = function (string) {
        if (!string) {
            return "english";
        }
        var position = string.search(/[A-Za-z]/);
        if (position >= 0) {
            return "english";
        }
        return "hebrew";
    };
    me.regex = function (string, options = "g") {
        if (string.startsWith("/")) {
            string = string.slice(1);
            string = new RegExp(string, options);
        }
        return string;
    };
    me.escape = function (string) {
        return string.replace(/[-[\]{}()*+!<=:?./\\^$|#\s,]/g, "\\$&");
    };
    me.match = function (source, target, wordStyle) {
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
    me.middleLetters = function (source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if (index !== -1) {
            return source.substring(index, index + target.length);
        }
        return "";
    };
    me.prefixLetters = function (source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if (index !== -1 && index) {
            return source.substring(0, index);
        }
        return "";
    };
    me.suffixLetters = function (source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if (index !== -1 && index + target.length < source.length) {
            return source.substring(index + target.length);
        }
        return "";
    };
    me.prefix = function (string, separator) {
        var prefix = string;
        if (string) {
            var tokens = string.split(separator);
            if (tokens && tokens.length > 1) {
                prefix = tokens[0];
            }
        }
        return prefix;
    };
    me.suffix = function (string, separator) {
        var suffix = "";
        if (string) {
            var tokens = string.split(separator);
            if (tokens && tokens.length > 1) {
                suffix = tokens[1];
            }
        }
        return suffix;
    };
    me.encode = function (string) {
        if (me.platform === "server" || me.platform === "service") {
            return Buffer.from((unescape(encodeURIComponent(string))), "binary").toString("base64");
        }
        else {
            return window.btoa(unescape(encodeURIComponent(string)));
        }
    };
    me.decode = function (string) {
        if (me.platform === "server" || me.platform === "service") {
            return decodeURIComponent(escape(Buffer.from(string, "base64").toString("binary")));
        }
        else {
            return decodeURIComponent(escape(window.atob(string)));
        }
    };
    me.blobToString = function (blob) {
        var url, request;
        url = URL.createObjectURL(blob);
        request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send();
        URL.revokeObjectURL(url);
        return request.responseText;
    };
    me.caselessCompare = function (source, target) {
        if ((source && !target) || (!source && target)) {
            return false;
        }
        if (!source && !target) {
            return true;
        }
        return source.toLowerCase() === target.toLowerCase();
    };
    me.optional = function (string, check) {
        var result = "";
        if (check) {
            result = string;
        }
        return result;
    };
    me.split = function (string, delimiter = " ", quote = "\"") {
        if (string) {
            return [].concat.apply([], string.split(quote).map(function (v, i) {
                return i % 2 ? v : v.split(delimiter);
            })).filter(Boolean);
        }
        else {
            return [];
        }
    };
    me.fill = function (string, params, prefix = "") {
        for (var param in params) {
            string = string.split(prefix + param).join(params[param]);
        }
        return string;
    };
    me.padNumber = function (string, size, char = " ") {
        string = String(string);
        var index = 0;
        for (; string[index] >= "0" && string[index] <= "9"; index++);
        var number = string.slice(0, index);
        while (number.length < size) { number = char + number; }
        string = number + string.slice(index);
        return string;
    };
    me.title = function (string) {
        string = string.split("_").map(token => {
            return token.charAt(0).toUpperCase() + token.slice(1);
        }).join(" ");
        string = string.replace(/([A-Z])/g, " $1").trim();
        string = string.replace(/\s\s/g, " ");
        return string;
    };
    me.trimEnd = function (string, character) {
        var position = string.indexOf(character);
        if (position != -1) {
            string = string.substring(0, position);
        }
        return string;
    };
    me.formatDuration = function (duration, long = false) {
        duration = parseInt(duration);
        var sec = duration % 60;
        var min = parseInt(duration / 60) % 60;
        var hour = parseInt(duration / (60 * 60)) % 24;
        var days = parseInt(duration / (24 * 60 * 60));
        if (hour < 10 && !long) {
            hour = "0" + hour;
        }
        if (min < 10 && !long) {
            min = "0" + min;
        }
        if (sec < 10 && !long) {
            sec = "0" + sec;
        }
        var formattedString = "";
        if (days) {
            formattedString = days + " days" + " + ";
        }
        if (!long) {
            formattedString = hour + ":" + min + ":" + sec;
        }
        else {
            if (hour) {
                formattedString += hour + " hours ";
            }
            if (min) {
                formattedString += min + " minutes ";
            }
            if (sec) {
                formattedString += sec + " seconds";
            }
            if (!formattedString) {
                formattedString = "now";
            }
        }
        formattedString = formattedString.trim();
        return formattedString;
    };
    me.formatBytes = function (number) {
        var set = false;
        if (number < 1000) {
            number = parseInt(number) + " B";
            set = true;
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " KB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " MB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " GB";
                set = true;
            }
        }
        if (!set) {
            number /= 1000;
            if (number < 1000) {
                number = parseInt(number) + " TB";
                set = true;
            }
        }
        return number;
    };
    me.charArray = function (first, last) {
        var a = [], i = first.charCodeAt(0), j = last.charCodeAt(0);
        for (; i <= j; ++i) {
            a.push(String.fromCharCode(i));
        }
        return a;
    };
    me.hash = function (string) {
        var i = string.length;
        var hash1 = 5381;
        var hash2 = 52711;

        while (i--) {
            const char = string.charCodeAt(i);
            hash1 = (hash1 * 33) ^ char;
            hash2 = (hash2 * 33) ^ char;
        }

        var hash = (hash1 >>> 0) * 4096 + (hash2 >>> 0);
        hash = String(hash);
        return hash;
    };
};
