/*
 @author Zakai Hamilton
 @component ManagerService
 */

screens.manager.service = function ManagerService(me) {
    me.items = function(callback) {
        me.core.service.list(callback);
    };
    return "server";
};
