/*
 @author Zakai Hamilton
 @component StorageFile
 */

package.require("storage.data", "server");
package.storage.data = function StorageData(me) {
    me.init = function () {
        me.datastore = require('@google-cloud/datastore');
        me.core.util.version(version => {
            var data = {
                date:Date(),
                version:version,
                port:me.core.http.port
            };
            me.core.console.log("startup: " + JSON.stringify(data));
            me.save(me.core.console.error, data, "startup");
        });
    };
    me.getService = function (callback) {
        if (me.service) {
            callback(me.service);
            return;
        }
        me.service = me.datastore({
            keyFilename: me.core.private.path("google")
        });
        callback(me.service);
    };
    me.save = function (callback, value, type = null, id = null) {
        me.getService((service) => {
            const key = service.key([type, id]);
            service.save({
                key: key,
                data: value
            }, function (err) {
                callback(err);
            });
        });
    };
    me.load = function(callback, type = null, id = null) {
        me.getService((service) => {
            const key = service.key([type, id]);
            service.get(key, function(err, value) {
                callback(err, value);
            });
        });
    };
};
