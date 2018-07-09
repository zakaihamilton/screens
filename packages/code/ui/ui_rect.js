/*
 @author Zakai Hamilton
 @component UIRect
 */

screens.ui.rect = function UIRect(me) {
    me.relativeRegion = function (object, parent = object.parentNode) {
        var parent_region = me.absoluteRegion(parent);
        var region = me.absoluteRegion(object);
        var xPos = region.left - parent_region.left;
        var yPos = region.top - parent_region.top;
        var width = region.width;
        var height = region.height;
        return {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
    };
    me.absoluteRegion = function (object) {
        if(!object) {
            return null;
        }
        if (object === document.body) {
            return me.viewport();
        }
        var clientRect = object.getBoundingClientRect();
        var xPos = 0;
        var yPos = 0;
        var width = object.offsetWidth;
        var height = object.offsetHeight;
        if (!width) {
            width = clientRect.width;
        }
        if (!height) {
            height = clientRect.height;
        }
        var parent = object;
        while (parent) {
            if (parent === document.body) {
                // deal with browser quirks with body/window/document and page scroll
                var xScroll = parent.scrollLeft || document.documentElement.scrollLeft;
                var yScroll = parent.scrollTop || document.documentElement.scrollTop;

                xPos += (parent.offsetLeft - xScroll + parent.clientLeft);
                yPos += (parent.offsetTop - yScroll + parent.clientTop);
            } else {
                // for all other non-BODY elements
                xPos += (parent.offsetLeft - parent.scrollLeft + parent.clientLeft);
                yPos += (parent.offsetTop - parent.scrollTop + parent.clientTop);
            }
            parent = parent.offsetParent;
        }
        xPos -= object.clientLeft;
        yPos -= object.clientTop;
        var absoluteRect = {
            left: xPos,
            top: yPos,
            width: width,
            height: height,
            right: xPos + width,
            bottom: yPos + height
        };
        return absoluteRect;
    };
    me.emptyRegion = function (region) {
        region.left = 0;
        region.top = 0;
        region.width = 0;
        region.height = 0;
    };
    me.setRelativeRegion = function (object, region, relative_to = null, move_only=false) {
        if (!object || !region) {
            return;
        }
        var parent_region = me.absoluteRegion(object.parentNode);
        if (relative_to) {
            var relative_to_region = me.absoluteRegion(relative_to);
            parent_region.left -= relative_to_region.left;
            parent_region.top -= relative_to_region.top;
        }
        object.style.left = region.left - parent_region.left + "px";
        object.style.top = region.top - parent_region.top + "px";
        if(!move_only) {
            object.style.width = region.width + "px";
            object.style.height = region.height + "px";
        }
    };
    me.setAbsoluteRegion = function (object, region) {
        if (object.parentNode === document.body) {
            object.style.left = region.left + "px";
            object.style.top = region.top + "px";
        } else {
            var parent_region = me.absoluteRegion(object.parentNode);
            object.style.left = region.left - parent_region.left + "px";
            object.style.top = region.top - parent_region.top + "px";
        }
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.inRegion = function (region, x, y) {
        return !(x < region.left || y < region.top || x > region.right || y > region.bottom);
    };
    me.viewport = function () {
        var e = window, a = 'inner';
        if (!('innerWidth' in window))
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        var width = e[ a + 'Width' ];
        var height = e[ a + 'Height' ];
        return {left: 0, top: 0, width: width, height: height, right: width, bottom: height};
    };
    me.inView = function(object) {
        var inView = true;
        var parentRect = me.absoluteRegion(object.parentNode);
        var objectRect = me.absoluteRegion(object);
        if(!parentRect) {
            inView = false;
        }
        else if(objectRect.left < parentRect.left) {
            inView = false;
        }
        else if(objectRect.right > parentRect.right) {
            inView = false;
        }
        else if(objectRect.top < parentRect.top) {
            inView = false;
        }
        else if(objectRect.bottom > parentRect.bottom) {
            inView = false;
        }
        return inView;
    }
};
