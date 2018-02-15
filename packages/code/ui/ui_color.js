/*
 @author Zakai Hamilton
 @component UIColor
 */

package.ui.color = function UIColor(me) {
    me.colors = [];
    me.random = function() {
        var allowed = "0369cf".split( '' ), s = "#";
        while ( s.length < 4 ) {
            s += allowed.splice( Math.floor( ( Math.random() * allowed.length ) ), 1 );
        }
        return s;
    };
    me.randomSet = function(count) {
        if(count < 0) {
            count = 0;
        }
        while(me.colors.length < count) {
            var color = me.random();
            while(me.colors.includes(color)) {
                color = me.random();
            }
            me.colors.push(color);
        }
        return me.colors.slice(0, count);
    };
    me.randomInSet = function(index) {
        if(index < 0) {
            index = 0;
        }
        var colors = me.randomSet(index+1);
        return colors[index];
    };
};
