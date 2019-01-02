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
        var uuid = "";
        for (var event of events) {
            if (event.event === "meeting_started") {
                uuid = event.payload.meeting.uuid;
                users = {};
            }
            if (event.event === "meeting_ended") {
                users = {};
            }
            if (event.event === "participant_joined" || event.event === "participant_left") {
                let participant = event.payload.meeting.participant;
                let id = participant.user_name.trim().toLowerCase();
                let info = users[id];
                if (event.event === "participant_joined") {
                    if (!info) {
                        info = users[id] = { count: 0 };
                    }
                    info.name = participant.user_name.trim();
                    info.count++;
                }
                if (event.event === "participant_left") {
                    if (info && info.count > 0) {
                        info.count--;
                    }
                }
            }
        }
        var names = Object.values(users).filter(user => user.count).map(user => user.name).filter(Boolean).sort();
        if (shuffle) {
            let letters = me.core.string.charArray("a", "z");
            letters.push(...me.core.string.charArray("א", "ת"));
            letters = me.shuffleSeed.shuffle(letters, uuid);
            let mapping = {};
            for (let name of names) {
                let firstLetter = name[0].toLowerCase();
                if (!letters.includes(firstLetter)) {
                    firstLetter = "other";
                }
                let list = mapping[firstLetter];
                if (!list) {
                    list = mapping[firstLetter] = [];
                }
                list.push(name);
            }
            names = [];
            for (let letter of letters) {
                let list = mapping[letter];
                if (list) {
                    names.push(...list);
                }
            }
            if (mapping.other) {
                names.push(...mapping.other);
            }
        }
        return names;
    };
    return "server";
};