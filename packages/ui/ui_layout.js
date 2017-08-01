/*
 @author Zakai Hamilton
 @component UILayout
 */

package.ui.layout = function UILayout(me) {
    me.content = function(target) {
        if(target && target.component === me.widget.container.id) {
            target = me.widget.container.content(target);
        }
        return target;
    };
    me.move = function(source, target) {
        target = me.content(target);
        do {
            var widget = source.firstChild;
            if(widget) {
                target.appendChild(widget);
            }
        } while(widget);
    };
    me.clear = function(target) {
        target = me.content(target);
        do {
            var widget = target.firstChild;
            if(widget) {
                target.removeChild(widget);
            }
        } while(widget);
    };
    me.prepare = function(source, target) {
        target = me.content(target);
        do {
            var widget = target.firstChild;
            if(widget) {
                var tagName = widget.tagName.toLowerCase();
                if(tagName === "div") {
                    do {
                        var childWidget = widget.firstChild;
                        if(childWidget) {
                            source.appendChild(childWidget);
                        }
                    } while(childWidget);
                    target.removeChild(widget);
                }
                else {
                    source.appendChild(widget);
                }
            }
        } while(widget);
    };
    me.pageSize = function(target) {
        var container = me.ui.node.container(target, me.widget.container.id).parentNode;
        var region = me.ui.rect.relative_region(container);
        var pageHeight = container.offsetHeight - region.top - 50;
        var pageWidth = container.offsetWidth - 80;
        return {width:pageWidth,height:pageHeight};
    };
    me.reflow = function(source, target, pageClass, columnCount=1) {
        target = me.content(target);
        me.prepare(source, target);
        var pageSize = me.pageSize(target);
        if(!source.firstChild) {
            return;
        }
        var pageIndex = 1;
        var page = me.createPage(target, pageClass, pageSize.width, pageSize.height, pageIndex, columnCount);
        var previousWidget = null;
        for(;;) {
            var widget = source.firstChild;
            if(!widget) {
                break;
            }
            page.appendChild(widget);
            var newPage = false;
            if(page.scrollHeight > page.clientHeight || page.scrollWidth > page.clientWidth) {
                newPage = true;
            }
            if(!(widget.innerHTML || widget.firstChild)) {
                page.removeChild(widget);
                widget = null;
            }
            if(newPage) {
                if(widget) {
                    page.removeChild(widget);
                }
                pageIndex++;
                page = me.createPage(target, pageClass, pageSize.width, pageSize.height, pageIndex, columnCount);
                if(previousWidget && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                    page.appendChild(previousWidget);
                }
                if(widget) {
                    page.appendChild(widget);
                }
                previousWidget = null;
            }
            else if(widget) {
                previousWidget = widget;
            }
        }
        me.createBreak(target);
        me.createBreak(target);
    };
    me.createPage = function(target, pageClass, pageWidth, pageHeight, pageIndex, columnCount) {
        target = me.content(target);
        var page = me.ui.element.create({
            "ui.basic.tag":"div",
            "ui.theme.class":pageClass,
            "ui.style.width":pageWidth + "px",
            "ui.style.height":pageHeight + "px",
            "ui.style.display":"block",
            "ui.style.columns":"" + (pageWidth / 3) + "px " + columnCount,
            "ui.style.columnGap":"40px"
        }, target);
        return page;
    };
    me.createBreak = function(target) {
        var page = me.ui.element.create({
            "ui.basic.tag":"br",
        }, target);
        return page;
    };
};
