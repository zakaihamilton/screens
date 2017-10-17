/*
 @author Zakai Hamilton
 @component StorageCache
 */

package.require("storage.remote", "server");

package.storage.remote = function StorageRemote(me) {
    me.init = function () {
        me.dropbox = require('dropbox');
    };
    me.getService = function(callback) {
        me.core.private.keys((keys) => {
            if(me.service) {
                callback(me.service);
                return;
            }
            me.service = new me.dropbox({ accessToken: keys['access-token'] });
            callback(me.service);
        }, "dropbox");
    };
    me.getChildren = function(callback, path) {
        me.getService((service) => {
            service.filesListFolder({path: ''})
              .then(function(response) {
                console.log(response);
              })
              .catch(function(error) {
                console.log(error);
              });
        });
    };
};
