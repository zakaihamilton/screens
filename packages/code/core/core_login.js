/*
 @author Zakai Hamilton
 @component CoreLogin
 */

screens.core.login = function CoreLogin(me, { core, storage }) {
    me.init = async function () {
        me.state = false;
        me.wasLoggedIn = false;
        me.info = await storage.local.db.get(me.id, "info");
        if (!me.info) {
            me.info = {};
        }
        core.property.link("core.http.headers", "core.login.headers", true);
        core.property.link("core.message.headers", "core.login.headers", true);
    };
    me.load = async function () {
        if (!core.util.isOnline()) {
            core.listener.signal(me.id);
            return;
        }
        await core.listener.wait(me.id);
    };
    me.setStatus = function (status) {
        me.status = status;
    };
    me.currentStatus = function () {
        return me.status;
    };
    me.userName = function () {
        return me.info.name;
    };
    me.userEmail = function () {
        return me.info.email;
    };
    me.isSignedIn = function () {
        return me.info.login;
    };
    me.signInState = function () {
        return me.state;
    };
    me.headers = function (info) {
        var token = me.info.token;
        if (me.info.login) {
            if (token) {
                if (!info.headers) {
                    info.headers = {};
                }
                info.headers["user_name"] = encodeURIComponent(me.info.name);
                info.headers["token"] = token;
                info.headers["user_email"] = encodeURIComponent(me.info.email);
                console.log("info.headers", info.headers);
            }
        }
    };
    return "browser";
};

function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);

    const { name, email } = payload;
    const token = response.credential;
    const me = screens.core.login;

    me.info = {
        name,
        email,
        token,
        login: true
    };

    me.state = true;

    screens.storage.local.db.set(me.id, "info", me.info);

    console.log("ID: " + payload.sub);
    console.log("Full Name: " + payload.name);
    console.log("Given Name: " + payload.given_name);
    console.log("Family Name: " + payload.family_name);
    console.log("Image URL: " + payload.picture);
    console.log("Email: " + payload.email);

    screens.core.listener.reset(me.id);
    screens.core.listener.signal(me.id);
}