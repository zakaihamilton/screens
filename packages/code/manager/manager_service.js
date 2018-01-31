/*
 @author Zakai Hamilton
 @component ManagerService
 */

package.require("manager.service", "server");

package.manager.service = function ManagerService(me) {
    me.items = function(callback) {
        me.core.service.list(callback);
    };
};
