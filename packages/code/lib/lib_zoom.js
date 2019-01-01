/*
 @author Zakai Hamilton
 @component LibZoom
 */

screens.lib.zoom = function LibZoom(me) {
    me.init = async function () {
        me.request = require("request");
        me.shuffleSeed = require("shuffle-seed");
        var keys = await me.core.private.keys("zoom");
        me.meetingId = keys.meetingId;
        me.core.property.link("core.http.receive", "lib.zoom.receive", true);
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
    me.receive = async function (info) {
        if (info.method === "POST" && info.url == "/zoom") {
            me.manager.event.push(me.id, JSON.parse(info.body));
        }
    };
    me.participants = async function (shuffle = false) {
        var users = {};
        var events = await me.manager.event.list(me.id);
        var start_time = null;
        for (var event of events) {
            if (event.event === "meeting_started") {
                start_time = event.payload.meeting.start_time;
            }
            if (event.event === "meeting_ended") {
                users = {};
            }
            if (event.event === "participant_joined") {
                let participant = event.payload.meeting.participant;
                users[participant.user_id] = participant.user_name;
            }
            if (event.event === "participant_left") {
                let participant = event.payload.meeting.participant;
                users[participant.user_id] = "";
            }
        }
        var names = Object.values(users).filter(Boolean).sort();
        if (shuffle) {
            names = me.shuffleSeed.shuffle(names, start_time);
        }
        return names;
    };
    return "server";
};