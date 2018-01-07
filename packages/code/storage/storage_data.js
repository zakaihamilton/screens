/*
 @author Zakai Hamilton
 @component StorageFile
 */

package.require("storage.data", "server");
package.storage.data = function StorageData(me) {
    me.init = function () {
        me.datastore = require('@google-cloud/datastore');
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
    me.save = function (callback, value, key=null) {
        var entries = [];
        me.getService((service) => {

        });
    };
};
