/*
 @author Zakai Hamilton
 @component StorageFile
 */

package.require("storage.data", "server");
package.storage.data = function StorageData(me) {
    me.init = function () {
        me.storage = require('@google-cloud/storage');
    };
    me.getService = function (callback) {
        if (me.service) {
            callback(me.service);
            return;
        }
        me.service = me.storage({keyFilename: me.core.private.path("google")});
        callback(me.service);
    };
    me.getBuckets = function (callback) {
        var entries = [];
        me.getService((service) => {
            service.getBuckets()
                    .then((results) => {
                        const buckets = results[0];
                        console.log('Buckets:');
                        buckets.forEach((bucket) => {
                            console.log(bucket.name);
                            entries.push(bucket.name);
                        });
                        callback(entries);
                    })
                    .catch((err) => {
                        console.error('ERROR:', err);
                        callback(null);
                    });
        });
    };
};
