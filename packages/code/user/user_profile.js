/*
 @author Zakai Hamilton
 @component UserProfile
 */

package.require("user.profile", "server");
package.user.profile = function UserProfile(me) {
    me.nonIndexed = [];
    me.add = function (callback, name, password) {
        me.flow(callback, (flow) => {
            flow.check(name, "profile name not provided");
            flow.check(password, "profile password not provided for user name: " + name);
            flow.async(me.exists, flow.continue, name);
            flow.wait((err, result) => {
                flow.error(err, "failed to check if profile exists");
                flow.check(!result, "profile " + name + " already exists");
                flow.async(me.core.has.gen, flow.resume, password);
                flow.wait((err, hash) => {
                    flow.error(err, "cannot generate hash for password " + password + " for user: " + name);
                    flow.check(hash, "invalid hash for password " + password + " for user: " + name);
                    flow.code(() => {
                        var date = new Date();
                        var profile = {
                            name: name,
                            password: hash,
                            date: date.toString(),
                        };
                        flow.async(me.storage.data.save, flow.continue, "user.profile", name, profile);
                        flow.wait((err) => {
                            flow.error(err, "Cannot save profile for user:" + name);
                            flow.end(null, profile);
                        });
                    });
                });
            });
        });
    };
    me.profile = function (callback, name) {
        me.flow(callback, (flow) => {
            flow.async(me.storage.data.load, flow.continue, "user.profile.data", name);
            flow.wait((err, profile) => {
                flow.error(err, "cannot retrieve " + name + " profile");
                flow.check(profile, name + " is an empty profile");
                flow.check(profile.name === name, name + " does not match name in profile: " + profile.name);
                flow.end(null, profile);
            });
        });
    };
    me.update = function (callback, profile) {
        me.flow(callback, (flow) => {
            flow.check(profile, "no profile was passed");
            flow.async(me.storage.data.save, "user.profile.data", profile.name, profile, me.nonIndexed);
            flow.wait((err) => {
                flow.error(err, "cannot save " + profile.name + " profile");
                flow.end();
            });
        });
    };
    me.exists = function (callback, name) {
        me.profile((err, profile) => {
            callback(err, profile ? true : false);
        }, name);
    };
    me.verify = function (callback, name, password) {
        me.flow(callback, (flow) => {
            flow.check(name, "empty name was passed");
            flow.check(password, "no password was passed for user: " + name);
            flow.async(me.profile, "user.profile.data", name);
            flow.wait((err, profile) => {
                flow.error(err, "cannot retrieve profile for user: " + name);
                flow.check(profile.password, "profile does not have a password for user: " + name);
                flow.async(me.core.hash.compare, password, profile.password);
                flow.wait((err, result) => {
                    flow.error(err, "cannot compare hash between:" + password + " and:" + profile.password);
                    flow.end(null, result);
                });
            });
        });
    };
};
