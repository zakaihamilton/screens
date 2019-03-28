/*
    @author Zakai Hamilton
    @component CorePrivate
*/

screens.core.private = function CorePrivate(me, packages) {
    const { core } = packages;
    me.keys = async function (name) {
        let path = me.path(name);
        var data = await me.file(path);
        var json = {};
        if (data) {
            json = JSON.parse(data);
        }
        return json;
    };
    me.path = function (name) {
        return "private/" + name + ".json";
    };
    me.file = async function (path) {
        var exists = core.file.exists(path);
        var data = null;
        if (exists) {
            data = await core.file.readFile(path, "utf8");
        }
        else {
            const request = require("request");
            const url = core.util.remoteUrl() + "/" + path;
            data = await new Promise((resolve, reject) => {
                request.get(url, (error, response, body) => {
                    if (response && response.statusCode !== 200) {
                        reject("Cannot retrieve private keys for: " + path + " status code: " + response.statusCode);
                    }
                    else if (error) {
                        reject("Cannot retrieve private keys for: " + path + " error: " + error);
                    }
                    else if (!body) {
                        reject(url + " is empty");
                    }
                    else {
                        resolve(body);
                    }
                });
            });
            await core.file.makeDir("private");
            await core.file.writeFile(path, data, "utf8");
        }
        return data;
    };
    return "server";
};
