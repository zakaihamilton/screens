/*
 @author Zakai Hamilton
 @component CoreString
 */

package.core.string = function CoreString(me) {
    me.parseWords = function (callback, string) {
        var result = me.splitBy(callback, string, [
            "\n",";",":",".",",","—","–","-","(",")","[","]","{","}","+","<",">","?"
        ], 0);
        return result;
    };
    me.clean = function(word) {
        if(word.startsWith("“")) {
            word = word.slice(1);
        }
        if(word.startsWith("ֿֿֿ\"")) {
            word = word.slice(1);
        }
        if(word.endsWith("ֿֿֿ\"")) {
            word = word.slice(0, -1);
        }
        return word;
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
        var position = string.search(/[\u0590-\u05FF]/);
        if(position >= 0){
            return "hebrew";
        }
        return "english";
    };
};
