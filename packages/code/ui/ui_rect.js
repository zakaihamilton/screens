/*
 @author Zakai Hamilton
 @component UIRect
 */

screens.ui.rect = function UIRect(me) {
    me.relative_region = function (object, parent = object.parentNode) {
        var parent_region = me.absolute_region(parent);
        var region = me.absolute_region(object);
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
    me.absolute_region = function (object) {
        if (object === document.body) {
            return me.viewport();
        }
        var clientRect = object.getBoundingClientRect();
        var xPos = 0;
        var yPos = 0;
        var width = object.clientWidth;
        var height = object.clientHeight;
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
    me.empty_region = function (region) {
        region.left = 0;
        region.top = 0;
        region.width = 0;
        region.height = 0;
    };
    me.set_relative_region = function (object, region, relative_to = null, move_only=false) {
        if (!object || !region) {
            return;
        }
        var parent_region = me.absolute_region(object.parentNode);
        if (relative_to) {
            var relative_to_region = me.absolute_region(relative_to);
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
    me.set_absolute_region = function (object, region) {
        if (object.parentNode === document.body) {
            object.style.left = region.left + "px";
            object.style.top = region.top + "px";
        } else {
            var parent_region = me.absolute_region(object.parentNode);
            object.style.left = region.left - parent_region.left + "px";
            object.style.top = region.top - parent_region.top + "px";
        }
        object.style.width = region.width + "px";
        object.style.height = region.height + "px";
    };
    me.in_region = function (region, x, y) {
        return !(x < region.left || y < region.top || x > region.right || y > region.bottom);
    };
    me.in_view_bounds = function (region) {
        var view = me.viewport();
        return !(region.left < view.left || region.top < view.top || region.right > view.right || region.bottom > view.bottom);
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
    me.inView = function (object) {
        let parentTop = object.parentNode.scrollTop;
        let parentBottom = parentTop + object.parentNode.clientHeight;
        let childTop = object.offsetTop;
        let childBottom = childTop + object.clientHeight;
        let isTotal = (childTop >= parentTop && childBottom <= parentBottom);
        let isPartial = ((childTop < parentTop && childBottom > parentTop) || (childBottom > parentBottom && childTop < parentBottom));
        return  (isTotal || isPartial);
    };
};
