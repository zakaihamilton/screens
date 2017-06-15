/*
 @author Zakai Hamilton
 @component UIRect
 */

package.ui.rect = function UIRect(me) {
    me.relative_region = function (object) {
        object = me.ui.element.to_object(object);
        var parent_region = me.absolute_region(object.parentNode);
        var region = me.absolute_region(object);
        var xPos = region.left - parent_region.left;
        var yPos = region.top - parent_region.top;
        var width = object.clientWidth;
        var height = object.clientHeight;
        return {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
    };
    me.absolute_region = function (object) {
        object = me.ui.element.to_object(object);
        var xPos = 0;
        var yPos = 0;
        var width = object.clientWidth;
        var height = object.clientHeight;

        while (object) {
            if (object.tagName === "BODY") {
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
    me.empty_region = function(region) {
        region.left = 0;
        region.top = 0;
        region.width = 0;
        region.height = 0;
    }
    me.set_relative_region = function(object, region) {
        object = me.ui.element.to_object(object);
        object.style.left = region.left + "px";
        object.style.top = region.top + "px";
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.set_absolute_region = function(object, region) {
        object = me.ui.element.to_object(object);
        if(object.style.position === "absolute") {
            object.style.left = region.left - object.clientLeft + "px";
            object.style.top = region.top - object.clientTop + "px";
        }
        else if(object.style.position === "relative") {
            object.style.left = region.left + "px";
            object.style.top = region.top + "px";
        }
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.in_region = function (rect, x, y) {
        return !(x < rect.left || y < rect.top || x > rect.right || y > rect.bottom)
    };
    me.viewport = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window))
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        var width = e[ a + 'Width' ]
        var height = e[ a + 'Height' ]
        return {left:0,top:0,width:width,height:height,right:width,bottom:height};
    };
}
