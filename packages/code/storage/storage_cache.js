/*
 @author Zakai Hamilton
 @component StorageCache
 */

screens.storage.cache = function StorageCache(me) {
    me.policy = {
        code: 'packages/code',
        res: 'packages/res'
    };
    me.init = function () {
        me.core.event.register(null, me, "fetch", me.fetch, "fetch", self, { respondWith: true });
        me.core.event.register(null, me, "activate", me.activate, "activate", self, { waitUntil: true });
        me.core.event.register(null, me, "install", me.install, "install", self, { waitUntil: true });
    };
    me.install = async function(object, event) {
        me.log("installed");
    };
    me.activate = async function (object, event) {
        me.log("activated");
        me.empty();
    };
    me.empty = async function() {
        var cacheNames = await caches.keys();
        for (cacheName of cacheNames) {
            me.log("deleted cache: " + cacheName);
            await caches.delete(cacheName);
        }
    };
    me.fetch = function(object, event) {
        if (/http:/.test(event.request.url)) {
             return;
        }
        return me.secureFetch(object, event);
    };
    me.secureFetch = async function (object, event) {
        me.log("fetch: " + event.request.url);
        var isCached = false;
        for (var cacheName in me.policy) {
            var matchUrl = me.policy[cacheName];
            var isMatch = event.request.url.match(matchUrl);
            if (!isMatch) {
                continue;
            }
            var cache = await caches.open(cacheName);
            var response = await cache.match(event.request);
            if (response) {
                isCached = true;
                break;
            }
            else {
                try {
                    response = await fetch(event.request);
                    if (response) {
                        cache.put(event.request, response.clone());
                    }
                }
                catch (err) {
                    me.log_error("fetch error: url: " + event.request.url + " err: " + err);
                }
                break;
            }
        }
        if (!response) {
            try {
                response = await fetch(event.request);
            }
            catch (err) {
                me.log_error("fetch error: url: " + event.request.url + " err: " + err);
                throw err;
            }
        }
        me.log("retrieved " + (isCached? "cached":"standard") + " response for url: " + event.request.url);
        return response;
    };
    return "service_worker";
};
