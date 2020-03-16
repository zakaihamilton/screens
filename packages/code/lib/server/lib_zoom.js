/*
 @author Zakai Hamilton
 @component LibZoom
 */

screens.lib.zoom = function LibZoom(me, { core, db }) {
    me.init = async function () {
        me.request = require("request");
        me.shuffleSeed = require("shuffle-seed");
        me.chance = require("chance").Chance();
        var keys = await core.private.keys("zoom");
        me.meetingId = keys.meetingId;
        me._meetingInfo = null;
        core.property.link("core.http.receive", "lib.zoom.receive", true);
    };
    me.token = async function () {
        var time = (new Date()).getTime();
        if (time < me.expire - 1000) {
            return me.currentToken;
        }
        me.expire = ((new Date()).getTime() + 5000);
        var keys = await core.private.keys("zoom");
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
        var meetingInfo = me._meetingInfo;
        if (!meetingInfo) {
            meetingInfo = await me.send("meetings/{meetingId}");
            if (meetingInfo) {
                meetingInfo = JSON.parse(meetingInfo);
            }
            me._meetingInfo = meetingInfo;
        }
        return meetingInfo;
    };
    me.receive = async function (info) {
        if (info.method === "POST" && info.url == "/zoom") {
            db.events.participants.push(JSON.parse(info.body));
        }
    };
    me.participants = async function (shuffle = false, test = false) {
        var users = {};
        var events = await db.events.participants.list();
        var uuid = "";
        for (var event of events) {
            if (event.payload.meeting && String(event.payload.meeting.id) !== me.meetingId) {
                continue;
            }
            if (event.event === "meeting_started") {
                uuid = event.payload.meeting.uuid;
                users = {};
            }
            if (event.event === "meeting_ended") {
                users = {};
            }
            if (event.event === "participant_joined" || event.event === "participant_left") {
                let participant = event.payload.meeting.participant;
                if (!participant.user_name) {
                    continue;
                }
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
        var names = Object.values(users).filter(user => user.count).map(user => user.name);
        if (test) {
            if (!me.randomNames) {
                me.randomNames = [];
                let randomMax = me.chance.integer({ min: 8, max: 16 });
                for (let randomIndex = 0; randomIndex < randomMax; randomIndex++) {
                    me.randomNames.push(me.chance.name());
                }
            }
            names = me.randomNames;
        }
        names = names.filter(Boolean).sort();
        if (shuffle && me.shuffleSeed) {
            names = me.shuffle(names, uuid);
        }
        return names;
    };
    me.shuffle = function (names, seed) {
        var result = [];
        let letters = core.string.charArray("a", "z");
        letters.push(...core.string.charArray("א", "ת"));
        letters = me.shuffleSeed.shuffle(letters, seed);
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
        for (let letter of letters) {
            let list = mapping[letter];
            if (list) {
                result.push(...list);
            }
        }
        if (mapping.other) {
            result.push(...mapping.other);
        }
        return result;
    };
    return "server";
};