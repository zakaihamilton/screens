/*
 @author Zakai Hamilton
 @component UIImage
 */

screens.ui.image = function UIImage(me) {
    me.images = [];
    me.preload = async function (path) {
        var items = await me.core.file.readDir(path);
        for (var item of items) {
            var image = me.images.find(image => image.src === path + "/" + item);
            if (image) {
                continue;
            }
            image = new Image();
            image.src = path + "/" + item;
            me.images.push(image);
        }
    };
    me.get = function (path) {
        return me[path.replace(/\./g, "_")];
    };
};