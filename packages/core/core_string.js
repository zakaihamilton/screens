/*
 @author Zakai Hamilton
 @component CoreString
 */

package.core.string = function CoreString(me) {
    me.parseWords = function (callback, string) {
        var result = me.splitBy(callback, string, [
            "\n",";",":",".",",","—","–","-","(",")","[","]","{","}","+","<",">","?","/","\\","”"
        ], 0);
        return result;
    };
    me.splitBy = function(callback, string, arrayOfDelimiters, index) {
        if(index >= arrayOfDelimiters.length) {
            var words = string.split(" ");
            callback(words);
            return words.join(" ");
        }
        return string.split(arrayOfDelimiters[index]).map(function(parts) {
            return me.splitBy(callback, parts, arrayOfDelimiters, index+1);
        }).join(arrayOfDelimiters[index]);
    };
    me.language = function(string) {
        var position = string.search(/[A-Z]/);
        if(position >= 0){
            return "english";
        }
        return "hebrew";
    };
};
