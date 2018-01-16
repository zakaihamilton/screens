/*
    @author Zakai Hamilton
    @component CoreHash
*/

package.require("core.file", "server");

package.core.hash = function CoreHash(me) {
    me.init = function(task) {
        me.bcrypt = require('bcryptjs');
    };
    me.gen = function(callback, password) {
        me.bcrypt.genSalt(10, function(err, salt) {
            if(err) {
                callback(err, null);
            }
            else {
                me.bcrypt.hash(password, salt, function(err, hash) {
                    callback(err, hash);
                });
            }
        });
    };
    me.compare = function(callback, password, hash) {
        me.bcrypt.compare(password, hash, function(err, result) {
            callback(err, result);
        });
    };
};
