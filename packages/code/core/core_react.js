/*
 @author Zakai Hamilton
 @component CoreReact
 */

screens.core.react = function CoreReact(me) {
    me.init = function () {
        me.babel = require("@babel/core");
    };
    me.parse = function (path, text) {
        if (!text) {
            return text;
        }
        try {
            text = me.babel.transform(text, {
                "plugins": [
                    ["@babel/plugin-transform-react-jsx", {}]
                ]
            }).code;
        }
        catch (err) {
            throw path + " - " + err;
        }
        return text;
    };
    return "server";
};
