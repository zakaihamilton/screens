/*
 @author Zakai Hamilton
 @component KabLetters
 */

package.kab.letters = function KabLetters(me) {
    me.source = {
        set: function(object, value) {
            var window = me.widget.window.window(object);
            window.kab_info = Object.assign({}, value);
            var sources = window.kab_info.sources;
            for(var sourceName in sources) {
                var source = sources[sourceName];
                source.letters = me.clean(source.verse);
            }
        }
    };
    me.clean = function(string) {
        return string.replace(/[^א-ת]/g, '');
    };
    me.values = {
        get: function(object) {
            var window = me.widget.window.window(object);
            var values = [];
            var sources = window.kab_info.sources;
            var sourceCount = Object.keys(sources).length;
            var columnCount = parseInt(window.kab_info.columnCount);
            var gridColumnCount = columnCount * (sourceCount+1);
            for(var sourceName in sources) {
                var source = sources[sourceName];
                var letters = source.letters;
                if(source.reverse) {
                    letters = letters.split("").reverse().join("");
                }
                for(var letterIndex = 0; letterIndex < letters.length; letterIndex++) {
                    var letter = letters[letterIndex];
                    var row = parseInt(letterIndex / columnCount) + 1;
                    var column = (gridColumnCount - (sourceCount+1)) - (((letterIndex % columnCount) * (sourceCount+1)) - source.offset) + 1;
                    values.push([row, column, letter, source.backgroundColor, source.borderColor]);
                }
            }
            return values;
        }
    };
};
