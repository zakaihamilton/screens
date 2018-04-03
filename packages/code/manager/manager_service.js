/*
 @author Zakai Hamilton
 @component ManagerService
 */

screens.manager.service = function ManagerService(me) {
    me.items = function() {
        return me.core.service.list();
    };
    return "server";
};
