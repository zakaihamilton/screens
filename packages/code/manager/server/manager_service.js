/*
 @author Zakai Hamilton
 @component ManagerService
 */

screens.manager.service = function ManagerService(me, packages) {
    const { core } = packages;
    me.items = function () {
        return core.socket.list("service");
    };
    return "server";
};
