/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = function CoreObject(me) {
    me.test = function() {
        return "Test";
    };
    me.switch = function(exp, cases) {
        if(cases[exp] === undefined) {
            if(cases["default"] !== undefined) {
                return cases["default"]();
            }
        }
        else {
            return cases[exp]();
        }
    };
};
