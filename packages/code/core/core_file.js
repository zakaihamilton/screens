/*
 @author Zakai Hamilton
 @component CoreFile
 */

package.require("core.file", "server");
package.core.file = function CoreFile(me) {
    me.init = function () {
        me.fs = require("fs");
        me.http = require("http");
    };
    me.readFile = function (callback, path, options) {
        try {
            me.fs.readFile(path, options, function (err, data) {
                callback(err, data);
            });
        }
        catch(e) {
            callback(e);
        }
    };
    me.makeDir = function (callback, path) {
        me.fs.mkdir(path, function (err) {
            callback(err);
        });
    };
    me.readDir = function (callback, path) {
        me.fs.readdir(path, function (err, items) {
            me.core.console.log("path:" + path + " items:" + JSON.stringify(items));
            callback(err, items);
        });
    };
    me.delete = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            if (err) {
                callback(err);
                return;
            }
            if (stats && stats.isDirectory()) {
                me.fs.rmdir(path, function (err) {
                    callback(err);
                });
            } else {
                me.fs.unlink(path, function (err) {
                    callback(err);
                });
            }
        });
    };
    me.isFile = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(stats ? stats.isFile() : false);
        });
    };
    me.isDirectory = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(stats ? stats.isDirectory() : false);
        });
    };
    me.size = function (callback, path) {
        me.fs.stat(path, function (err, stats) {
            callback(err, stats.size);
        });
    };
    me.download = function (callback, source, target) {
        var file = me.fs.createWriteStream(target);
        me.http.get(source, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(callback);  // close() is async, call cb after close completes.
            });
        }).on('error', function (err) { // Handle errors
            me.fs.unlink(target); // Delete the file async. (But we don't check the result)
            callback(err);
        });
    };
};
