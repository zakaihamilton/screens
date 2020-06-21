/*
 @author Zakai Hamilton
 @component APIDigitalOcean
 */

screens.api.digitalocean = function APIDigitalOcean(me) {
    me.init = async () => {
        me.rp = require("request-promise-native");
    };
    me.send = (path, method = "GET", ...params) => {
        return me.rp({
            method,
            uri: `https://api.digitalocean.com/v2${path}`,
            headers: {
                Authorization: `Bearer ${process.env.DO_TOKEN}`,
                "Content-Type": "application/json"
            },
            json: true,
            ...params
        });
    };
    me.account = () => {
        return me.send("/account");
    };
    me.droplets = async () => {
        const result = await me.send("/droplets");
        result.droplets.forEach(droplet => {
            droplet.ip = droplet.networks.v4[0].ip_address;
        });
        return result.droplets;
    };
    me.accountKeys = () => {
        return me.send("/account/keys");
    };
    return "server";
};
