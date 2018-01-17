/*
 @author Zakai Hamilton
 @component UserProfile
 */

package.require("user.profile", "server");
package.user.profile = function UserProfile(me) {
    me.nonIndexed = [];
    me.add = function(callback, name, password) {
        if(!name) {
            callback(new Error("profile name not provided"), null);
        }
        else if(!password) {
            callback(new Error("profile password not provided for user name: " + name), null);
        }
        else {
            me.exists((err, result) => {
                if(err) {

                }
                else if(result) {
                    err = new Error("profile " + name + " already exists");
                }
                if(err) {
                    callback(err, null);
                }
                else {
                    me.core.hash.gen((err, hash) => {
                        if(err) {
                            err = new Error("cannot generate hash for password " + password + " for user: " + name + ": " + err.message);
                        }
                        else {
                            var date = new Date();
                            var profile = {
                                name:name,
                                password:hash,
                                date: date.toString(),
                            };
                            me.storage.data.save(err => {
                                if(err) {
                                    err = new Error("cannot save profile for user: " + name + ": " + err.message);
                                    callback(err, null);
                                }
                                else {
                                    callback(null, profile);
                                }
                            });
                        }
                        if(err) {
                            callback(err, null);
                        }
                    });
                }
            }, name);
        }
    };
    me.profile = function(callback, name) {
        me.storage.data.load((err, profile) => {
            if(err) {
                err = new Error("cannot retrieve " + name + " profile: " + err.message);
            }
            else if(!profile) {
                err = new Error(name + " is an empty profile");
            }
            else if(profile.name !== name) {
                err = new Error(name + " does not match name in profile: " + profile.name);
            }
            if(err) {
                callback(err, null);
            }
            else {
                callback(null, profile);
            }
        }, "user.profile.data", name);
    };
    me.profile = function(callback, name) {
        me.storage.data.load((err, profile) => {
            if(err) {
                err = new Error("cannot retrieve " + name + " profile: " + err.message);
            }
            else if(!profile) {
                err = new Error(name + " is an empty profile");
            }
            else if(profile.name !== name) {
                err = new Error(name + " does not match name in profile: " + profile.name);
            }
            if(err) {
                callback(err, null);
            }
            else {
                callback(null, profile);
            }
        }, "user.profile.data", name);
    };
    me.update = function(callback, profile) {
        var err = null;
        if(!profile) {
            var err = new Error(name + " is an empty profile");
            callback(err);
            return;
        }
        me.storage.data.save((err) => {
            if(err) {
                err = new Error("cannot save " + profile.name + " profile: " + err.message);
                callback(err);
                return;
            }
            callback(null);
        }, "user.profile.data", profile.name, profile, me.nonIndexed);
    };
    me.exists = function(callback, name) {
        me.profile((err, profile) => {
            callback(err, profile ? true : false);
        }, name);
    };
    me.verify = function(callback, name, password) {
        me.profile((err, profile) => {
            if(err) {
                callback(err, false);
            }
            else if(profile.password) {
                me.core.hash.compare((err, result) => {
                    callback(err, result);
                }, password, profile.password);
            }
        }, "user.profile.data", name);
    };
};
