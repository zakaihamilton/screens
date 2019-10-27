/*
 @author Zakai Hamilton
 @component UIImage
 */

screens.ui.image = function UIImage(me, { core }) {
    me.images = [];
    me.preload = async function (path) {
        var items = await core.file.readDir(path);
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
    me.get = function (name) {
        return me[name];
    };
};