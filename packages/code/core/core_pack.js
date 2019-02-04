/*
    @author Zakai Hamilton
    @component CorePack
*/

screens.core.pack = function CorePack(me) {
    me.init = function () {

    };
    me.collect = async function (rootPath, target, extFilter) {
        var body = "";
        await me.core.file.iterate(rootPath, true, async (path) => {
            var ext = me.core.path.extension(path);
            var fileName = me.core.path.fileName(path);
            if (extFilter && !extFilter.includes(ext)) {
                return;
            }
            var [package, component, platform] = fileName.split("_");
            if (!package || !component) {
                return;
            }
            var data = await me.core.file.readFile(path, "utf8");
            var handler = me[ext];
            if (handler) {
                var info = {
                    path,
                    package,
                    component,
                    platform,
                    target,
                    ext
                };
                var result = await handler(info, data);
                if (result) {
                    body += result;
                }
            }
            else {
                body += data;
            }
        });
        return body;
    };
    me.js = function (info, data) {
        var body = "";
        if (info.platform && info.platform !== info.target) {
            body = `screens.${info.package}.${info.component} = function (me) {
                return "${info.platform}";
            };`;
        }
        else {
            body = data;
        }
        return body;
    };
    me.json = function (info, data) {
        var body = `\n screens.${info.package}.${info.component}.${info.ext} = `;
        body += data + ";\n";
        return body;
    };
};