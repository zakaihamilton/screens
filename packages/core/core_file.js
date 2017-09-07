/*
    @author Zakai Hamilton
    @component CoreFile
*/

package.core.file = function CoreFile(me) {
    me.init = function() {
        me.fs = require("fs");
    };
    me.readFile = function(callback, filePath, options) {
        me.fs.readFile(filePath, options, function (err, data) {
            callback(err, data);
        });
    };
};
