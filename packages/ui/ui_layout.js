/*
 @author Zakai Hamilton
 @component UILayout
 */

package.ui.layout = function UILayout(me) {
    me.content = function (target) {
        if (target && target.component === me.widget.container.id) {
            target = me.widget.container.content(target);
        }
        return target;
    };
    me.move = function (source, target) {
        target = me.content(target);
        do {
            var widget = source.firstChild;
            if (widget) {
                target.appendChild(widget);
            }
        } while (widget);
    };
    me.clear = function (target) {
        target = me.content(target);
        do {
            var widget = target.firstChild;
            if (widget) {
                target.removeChild(widget);
            }
        } while (widget);
    };
    me.prepare = function (source, target) {
        target = me.content(target);
        do {
            var widget = target.firstChild;
            if (widget) {
                var tagName = widget.tagName ? widget.tagName.toLowerCase() : "";
                if (tagName === "div") {
                    var content = widget.var.content;
                    do {
                        var childWidget = content.firstChild;
                        if (childWidget) {
                            source.appendChild(childWidget);
                        }
                    } while (childWidget);
                    widget.removeChild(widget.var.content);
                    widget.var.content = null;
                    target.removeChild(widget);
                } else {
                    source.appendChild(widget);
                }
            }
        } while (widget);
    };
    me.pageSize = function (target) {
        var container = me.ui.node.container(target, me.widget.container.id);
        var region = me.ui.rect.relative_region(container);
        var pageHeight = container.parentNode.offsetHeight - region.top;
        var pageWidth = container.parentNode.offsetWidth;
        return {width: pageWidth, height: pageHeight};
    };
    me.reflow = function (source, target, options) {
        target = me.content(target);
        me.prepare(source, target);
        var pageSize = me.pageSize(target);
        if (!source.firstChild) {
            return;
        }
        var pageIndex = 1;
        var page = null, content = null;
        if (options.usePages) {
            page = me.createPage(target, pageSize.width, pageSize.height, pageIndex, options);
            content = page.var.content;
        }
        var previousWidget = null;
        for (; ; ) {
            var widget = source.firstChild;
            if (!widget) {
                break;
            }
            var location = content ? content : target;
            if (widget.style && widget.style.order) {
                location.insertBefore(widget, me.widgetByOrder(location, widget.style.order));
            } else {
                location.appendChild(widget);
            }
            if (!page) {
                continue;
            }
            var newPage = false;
            if (content.scrollHeight > content.clientHeight || content.scrollWidth > content.clientWidth) {
                newPage = true;
            }
            if (!(widget.innerHTML || widget.firstChild)) {
                content.removeChild(widget);
                widget = null;
            }
            if (newPage) {
                if (widget) {
                    content.removeChild(widget);
                }
                pageIndex++;
                page = me.createPage(target, pageSize.width, pageSize.height, pageIndex, options);
                content = page.var.content;
                if (previousWidget && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                    content.appendChild(previousWidget);
                }
                if (widget) {
                    content.appendChild(widget);
                }
                previousWidget = null;
            } else if (widget) {
                previousWidget = widget;
            }
        }
        me.createBreak(target);
        me.createBreak(target);
    };
    me.widgetByOrder = function (page, order) {
        var widget = page.firstChild;
        var match = null;
        for (; ; ) {
            if (!widget) {
                break;
            }
            if (widget.style.order) {
                if (parseInt(widget.style.order) > parseInt(order)) {
                    match = widget;
                    break;
                }
            }
            widget = widget.nextSibling;
        }
        return match;
    };
    me.createPage = function (target, pageWidth, pageHeight, pageIndex, options) {
        target = me.content(target);
        var page = me.ui.element.create({
            "ui.basic.tag": "div",
            "ui.theme.class": options.pageClass,
            "ui.style.width": pageWidth + "px",
            "ui.style.height": pageHeight + "px",
            "ui.attribute.pageNumber": pageIndex,
            "ui.basic.elements": [
                {
                    "ui.basic.tag":"div",
                    "ui.theme.class": options.pageNumberClass,
                    "ui.basic.var": "pageNumber",
                    "ui.basic.text":pageIndex
                },
                {
                    "ui.basic.tag":"div",
                    "ui.theme.class": options.contentClass,
                    "ui.style.columnCount": options.columnCount,
                    "ui.style.columnGap": "100px",
                    "ui.basic.var": "content",
                    "ui.style.overflow": "hidden"
                }
            ]
        }, target, "self");
        return page;
    };
    me.createBreak = function (target) {
        var page = me.ui.element.create({
            "ui.basic.tag": "br"
        }, target);
        return page;
    };
};
