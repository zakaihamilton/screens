/*
    @author Zakai Hamilton
    @component CoreFile
*/

package.core.file = function CoreFile(me) {
    me.init = function() {
        me.fs = require("fs");
    };
    me.readFile = function(callback, path, options) {
        me.fs.readFile(path, options, function (err, data) {
            callback(err, data);
        });
    };
    me.readDir = function(callback, path) {
        me.fs.readdir(path, function(err, items) {
            console.log("path:" + path + " items:" + JSON.stringify(items));
            callback(err, items);
        });   
    };
    me.isFile = function(callback, path) {
        me.fs.stat(path, function(err, stats) {
            callback(stats ? stats.isFile() : false);
        });
    };
    me.isDirectory = function(callback, path) {
        me.fs.stat(path, function(err, stats) {
            callback(stats ? stats.isDirectory() : false);
        });
    };
};
