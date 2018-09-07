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
        me.core.event.register(null, me, "fetch", me.events.fetch, "fetch", self, { respondWith: true });
        me.core.event.register(null, me, "activate", me.events.activate, "activate", self, { waitUntil: true });
        me.core.event.register(null, me, "install", me.events.install, "install", self, { waitUntil: true });
    };
    me.events = {
        install: async function (object, event) {
            me.log("installed");
        },
        activate: async function (object, event) {
            me.log("activated");
            var cacheList = await me.list();
            cacheList.map(item => {
                me.log("cache: " + item.cache + "index: " + item.index + "url: " + item.url);
            });
            me.empty();
        },
        fetch: function (object, event) {
            if (/http:/.test(event.request.url)) {
                return;
            }
            return me.secureFetch(object, event);
        }
    };
    me.empty = async function () {
        var cacheNames = await caches.keys();
        for (cacheName of cacheNames) {
            me.log("deleted cache: " + cacheName);
            await caches.delete(cacheName);
        }
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
        me.log("retrieved " + (isCached ? "cached" : "standard") + " response for url: " + event.request.url);
        return response;
    };
    me.list = async function () {
        var list = [];
        var cacheNames = await caches.keys();
        for (cacheName of cacheNames) {
            var cache = await caches.open(cacheName);
            var keys = await cache.keys();
            keys.forEach(function (request, index, array) {
                list.push({
                    url:request.url,
                    cache:cacheName,
                    index:index
                });
            });
        }
        return list;
    };
    return "service_worker";
};
