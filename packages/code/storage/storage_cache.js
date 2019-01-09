/*
 @author Zakai Hamilton
 @component StorageCache
 */

screens.storage.cache = function StorageCache(me) {
    me.policy = {
        code: 'packages/code',
        res: 'packages/res',
        custom: 'custom'
    };
    me.init = function () {
        me.core.event.register(null, me, "fetch", me.events.fetch, "fetch", self, { respondWith: true });
        me.core.event.register(null, me, "activate", me.events.activate, "activate", self, { waitUntil: true });
        me.core.event.register(null, me, "install", me.events.install, "install", self, { waitUntil: true });
    };
    me.setCustom = async function (path, content, type) {
        const response = new Response(content, {
            headers: {
                "content-type": type
            }
        });
        var cache = await caches.open("custom");
        await cache.put(path, response);
    };
    me.events = {
        install: async function (object, event) {
            me.log("installed");
            self.skipWaiting();
        },
        activate: async function (object, event) {
            me.log("activated");
        },
        fetch: function (object, event) {
            me.log("fetch: " + event.request.url);
            if (/http:/.test(event.request.url) && !/custom/.test(event.request.url)) {
                return;
            }
            if (event.request.url.endsWith("/")) {
                return;
            }
            for (var cacheName in me.policy) {
                var matchUrl = me.policy[cacheName];
                var isMatch = event.request.url.match(matchUrl);
                if (isMatch) {
                    return me.secureFetch(object, event);
                }
            }
        }
    };
    me.empty = async function () {
        var cacheNames = await caches.keys();
        for (let cacheName of cacheNames) {
            me.log("deleted cache: " + cacheName);
            await caches.delete(cacheName);
        }
    };
    me.asyncFetchAndCache = function (object, event, cache) {
        fetch(event.request).then(response => {
            me.log("fetched response for: " + event.request.url);
            if (response) {
                cache.put(event.request, response.clone());
            }
        }).catch(err => {
            me.log_error("fetch error: url: " + event.request.url + " err: " + err);
        });
    };
    me.secureFetch = async function (object, event) {
        me.log("secure fetch: " + event.request.url);
        var isCached = false;
        var response = null;
        var cacheList = await me.list();
        cacheList.map(item => {
            me.log("cache: " + item.cache + " index: " + item.index + " url: " + item.url);
        });
        for (var cacheName in me.policy) {
            var matchUrl = me.policy[cacheName];
            var isMatch = event.request.url.match(matchUrl);
            if (!isMatch) {
                continue;
            }
            var cache = await caches.open(cacheName);
            response = await cache.match(event.request);
            if (response) {
                me.asyncFetchAndCache(object, event, cache);
                isCached = true;
                break;
            }
            else {
                cache = null;
            }
        }
        if (!response) {
            try {
                response = await fetch(event.request);
                if (cache && response) {
                    cache.put(event.request, response.clone());
                }
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
        for (let cacheName of cacheNames) {
            var cache = await caches.open(cacheName);
            var keys = await cache.keys();
            keys.forEach(function (request, index, array) {
                list.push({
                    url: request.url,
                    cache: cacheName,
                    index: index
                });
            });
        }
        return list;
    };
    return "service_worker";
};
