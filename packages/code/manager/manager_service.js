/*
 @author Zakai Hamilton
 @component ManagerService
 */

screens.manager.service = function ManagerService(me) {
    me.items = function () {
        return me.core.socket.list("service");
    };
    return "server";
};
