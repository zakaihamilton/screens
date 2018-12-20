/*
    @author Zakai Hamilton
    @component CoreHash
*/

screens.core.hash = function CoreHash(me) {
    me.init = function () {
        me.bcrypt = require('bcryptjs');
    };
    me.gen = function (password) {
        return new Promise((resolve, reject) => {
            me.bcrypt.genSalt(10, function (err, salt) {
                if (err) {
                    reject(err);
                    return;
                }
                else {
                    me.bcrypt.hash(password, salt, function (err, hash) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(hash);
                        }
                    });
                }
            });
        });
    };
    me.compare = function (password, hash) {
        return new Promise((resolve, reject) => {
            me.bcrypt.compare(password, hash, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return "server";
};
