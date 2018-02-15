/*
 @author Zakai Hamilton
 @component UIColor
 */

package.ui.color = function UIColor(me) {
    me.colors = [];
    me.random = function() {
        return 'hsla(' + (Math.random() * 360) + ', 100%, 40%, 1)';
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
