/*
    @author Zakai Hamilton
    @component CoreApp
*/

package.core.app = function CoreApp(me) {
    me.forward = {
        get : function(object, property) {
            return {
                set: function (object, value) {
                    package.include("app." + property, function (info) {
                        if (info.complete) {
                            me.send("app." + property + ".launch");
                        }
                    });
                }
            };
        }
    };
};
