/*
 @author Zakai Hamilton
 @component UIRect
 */

package.ui.rect = new function UIRect() {
    var me = this;
    me.region = function (object) {
        var xPos = 0;
        var yPos = 0;
        var width = object.offsetWidth;
        var height = object.offsetHeight;

        while (object) {
            if (object.tagName == "BODY") {
                // deal with browser quirks with body/window/document and page scroll
                var xScroll = object.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = object.scrollTop || document.documentElement.scrollTop;

                xPos += (object.offsetLeft - xScroll + object.clientLeft);
                yPos += (object.offsetTop - yScroll + object.clientTop);
            } else {
                // for all other non-BODY elements
                xPos += (object.offsetLeft - object.scrollLeft + object.clientLeft);
                yPos += (object.offsetTop - object.scrollTop + object.clientTop);
            }

            object = object.offsetParent;
        }
        return {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
    }
    me.in_region = function (rect, x, y) {
        return !(x < rect.left || y < rect.top || x > rect.right || y > rect.bottom)
    };
}