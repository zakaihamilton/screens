/*
    @author Zakai Hamilton
    @component CorePerformance
*/

screens.core.performance = function CorePerformance(me) {
    me.users = {};
    me.profile = function (name, userId, userName) {
        var userInfo = me.users[userId];
        if (!userInfo) {
            userInfo = me.users[userId] = {
                name: userName,
                profiles: {}
            };
        }
        var userProfile = userInfo.profiles[name];
        if (!userProfile) {
            userProfile = userInfo.profiles[name] = {};
        }
        return userProfile;
    };
    me.start = function (name, userId, userName) {
        if (!userId) {
            userId = this.userId;
        }
        if (!userName) {
            userName = this.userName;
        }
        var userProfile = me.profile(name, userId, userName);
        if (!userProfile) {
            throw "Cannot create profile for name: " + name +
            " userId: " + userId +
            " userName: " + userName;
        }
        userProfile.start = me.core.util.start();
        return userProfile.start;
    };
    me.duration = function (name, userId, userName) {
        if (!userId) {
            userId = this.userId;
        }
        if (!userName) {
            userName = this.userName;
        }
        var userProfile = me.profile(name, userId, userName);
        if (!userProfile) {
            throw "Cannot create profile for name: " + name +
            " userId: " + userId +
            " userName: " + userName;
        }
        if (!userProfile.start) {
            throw "Performance was never started name: " + name +
            " userId: " + userId +
            " userName: " + userName;
        }
        userProfile.duration = me.core.util.duration(userProfile.start);
        return userProfile.duration;
    };
    return "server";
};
