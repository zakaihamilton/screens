/*
 @author Zakai Hamilton
 @component CoreString
 */

package.core.string = function CoreString(me) {
    me.delimiters = function() {
        var delimiters = [
            "\n",";",":",".",",","—","–","-","(",")","[","]","{","}","+","<",">","?","/","\\","”","“","!","\"","…","'","‘","’"
        ];
        return delimiters;
    };
    me.hasDelimiter = function(string) {
        var delimiters = me.delimiters();
        var result = false;
        for(var index = 0; index < delimiters.length - 1; index++) {
            var delimiter = delimiters[index];
            if(string.includes(delimiter)) {
                result = true;
                break;
            }
        }
        return result;
    };
    me.unparseWords = function(string) {
        var delimiters = me.delimiters();
        for(var index = 0; index < delimiters.length; index++) {
            var delimiter = delimiters[index];
            string = string.split(" " + delimiter + " ").join(delimiter);
        }
        return string;
    };
    me.parseWords = function(callback, string) {
        var delimiters = me.delimiters();
        for(var index = 0; index < delimiters.length; index++) {
            var delimiter = delimiters[index];
            string = string.split(delimiter).join(" " + delimiter + " ");
        }
        var words = string.split(" ");
        callback(words);
        string = words.join(" ");
        for(index = 0; index < delimiters.length; index++) {
            var delimiter = delimiters[index];
            string = string.split(" " + delimiter + " ").join(delimiter);
        }
        return string;
    };
    me.language = function(string) {
        var position = string.search(/[A-Z]/);
        if(position >= 0){
            return "english";
        }
        return "hebrew";
    };
    me.regex = function (string, options='g') {
        if (string.startsWith("/")) {
            string = string.slice(1);
            string = new RegExp(string, options);
        }
        return string;
    };
    me.escape = function(string) {
        return string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
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
    me.middleLetters = function(source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if(index !== -1) {
            return source.substring(index, index + target.length);
        }
        return "";
    };
    me.prefixLetters = function(source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if(index !== -1 && index) {
            return source.substring(0, index);
        }
        return "";
    };
    me.suffixLetters = function(source, target) {
        var index = source.toUpperCase().indexOf(target.toUpperCase());
        if(index !== -1 && index + target.length < source.length) {
            return source.substring(index + target.length);
        }
        return "";
    };
    me.prefix = function(string, separator) {
        var prefix = string;
        if(string) {
            var tokens = string.split(separator);
            if(tokens && tokens.length > 1) {
                prefix = tokens[0];
            }
        }
        return prefix;
    };
    me.suffix = function(string, separator) {
        var suffix = "";
        if(string) {
            var tokens = string.split(separator);
            if(tokens && tokens.length > 1) {
                suffix = tokens[1];
            }
        }
        return suffix;
    };
    me.encode = function(string) {
        return window.btoa(unescape(encodeURIComponent(string)));
    };
    me.decode = function(string) {
        return decodeURIComponent(escape(window.atob(string)));
    };
    me.blobToString = function(blob) {
        var url, request;
        url = URL.createObjectURL(blob);
        request = new XMLHttpRequest();
        request.open('GET', url, false);
        request.send();
        URL.revokeObjectURL(url);
        return request.responseText;
    };
};
