/*
 @author Zakai Hamilton
 @component ManagerService
 */

screens.manager.service = function ManagerService(me, { core }) {
    me.items = function () {
        return core.socket.list("service");
    };
    return "server";
};
