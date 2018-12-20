/*
 @author Zakai Hamilton
 @component LibZoom
 */

screens.lib.zoom = function LibZoom(me) {
    me.init = async function () {
        me.request = require("request");
        var keys = await me.core.private.keys("zoom");
        me.meetingId = keys.meetingId;
    };
    me.token = async function () {
        var time = (new Date()).getTime();
        if (time < me.expire - 1000) {
            return me.currentToken;
        }
        me.expire = ((new Date()).getTime() + 5000);
        var keys = await me.core.private.keys("zoom");
        var jwt = require("jsonwebtoken");
        var payload = {
            iss: keys.key,
            exp: me.expire
        };
        me.currentToken = jwt.sign(payload, keys.secret);
        return me.currentToken;
    };
    me.send = async function (url, body = null, method = "get") {
        var token = await me.token();
        var headers = {
            "Authorization": "Bearer " + token
        };
        if (body && method === "get") {
            method = "post";
        }
        if (body && typeof body === "string") {
            body = JSON.parse(body);
        }
        var params = {
            meetingId: me.meetingId
        };
        url = url.replace(/{[^{}]*}/g, function (match) {
            var key = match.substring(1, match.length - 1);
            return params[key];
        });
        var info = {
            url: "https://api.zoom.us/v2/" + url,
            headers
        };
        return new Promise((resolve, reject) => {
            me.request[method.toLowerCase()](info, (error, response, body) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(body);
                }
            });
        });
    };
    me.meetingInfo = async function () {
        var meetingInfo = await me.send("meetings/{meetingId}");
        if (meetingInfo) {
            meetingInfo = JSON.parse(meetingInfo);
        }
        return meetingInfo;
    };
    return "server";
};