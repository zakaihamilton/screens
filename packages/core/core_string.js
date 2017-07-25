/*
 @author Zakai Hamilton
 @component CoreString
 */

package.core.string = function CoreString(me) {
    me.parseWords = function (string, callback) {
        var result = me.splitBy(string, [
            ";",":",".",",","—","-","(",")","[","]","{","}","+","<",">","”","“","\"","?"
        ], callback, 0);
        return result;
    };
    me.splitBy = function(string, arrayOfDelimiters, callback, index) {
        if(index >= arrayOfDelimiters.length) {
            var words = string.split(" ");
            callback(words);
            return words.join(" ");
        }
        return string.split(arrayOfDelimiters[index]).map(function(parts) {
            return me.splitBy(parts, arrayOfDelimiters, callback, index+1);
        }).join(arrayOfDelimiters[index]);
    };
};
