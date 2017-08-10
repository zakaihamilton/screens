/*
 @author Zakai Hamilton
 @component CoreString
 */

package.core.string = function CoreString(me) {
    me.delimiters = function() {
        var delimiters = [
            "\n",";",":",".",",","—","–","-","(",")","[","]","{","}","+","<",">","?","/","\\","”","“","!","\""
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
};
