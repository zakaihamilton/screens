/*
 @author Zakai Hamilton
 @component ManagerService
 */

package.manager.service = function ManagerService(me) {
    me.items = function(callback) {
        me.core.service.list(callback);
    };
    return "server";
};
