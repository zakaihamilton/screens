/*
 @author Zakai Hamilton
 @component CoreId
 */

package.core.ref = new function() {
    this.current = 1000;
    this.gen = function() {
        this.current++;
        return "ref:" + this.current;
    };
};
