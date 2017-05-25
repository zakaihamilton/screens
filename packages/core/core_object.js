/*
    @author Zakai Hamilton
    @component CoreObject
*/

package.core.object = new function CoreObject() {
    this.test = function() {
        return "Test";
    };
    this.switch = function(exp, cases) {
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
