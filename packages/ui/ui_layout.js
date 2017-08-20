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
                            if (childWidget.style) {
                                childWidget.style.fontSize = "";
                            }
                        }
                    } while (childWidget);
                    widget.removeChild(widget.var.content);
                    widget.var.content = null;
                    target.removeChild(widget);
                } else {
                    source.appendChild(widget);
                    if (widget.style) {
                        widget.style.fontSize = "";
                    }
                }
            }
        } while (widget);
    };
    me.pageSize = function (target) {
        var container = me.ui.node.container(target, me.widget.container.id);
        var scrollbar = container.var.vertical;
        var pageHeight = container.parentNode.offsetHeight;
        var pageWidth = container.parentNode.offsetWidth;
        pageWidth -= scrollbar.offsetWidth + 1;
        return {width: pageWidth, height: pageHeight};
    };
    me.firstVisiblePage = function (target) {
        target = me.content(target);
        var page = null;
        var widget = target.firstChild;
        while (widget) {
            if (widget.offsetTop >= target.scrollTop) {
                page = widget;
                break;
            }
            widget = widget.nextSibling;
        }
        return page;
    };
    me.firstVisibleWidget = function (target) {
        var page = me.firstVisiblePage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div") {
                return page.var.content.firstChild;
            }
        }
        return page;
    };
    me.scrollToWidget = function (widget, target) {
        if (widget) {
            target = me.content(target);
            var parent = widget.parentNode;
            while (parent) {
                if (parent.parentNode === target) {
                    me.set(target, "widget.scrollbar.vertical.scrollTo", parent.offsetTop);
                    break;
                }
                parent = parent.parentNode;
            }
        }
    };
    me.reflow = function (callback, source, target, options) {
        var layoutContent = me.content(target);
        if (target.reflowInterval) {
            clearInterval(target.reflowInterval);
            target.reflowInterval = null;
            me.move(source, me.page ? me.page.var.content : layoutContent);
            if (!target.notified && callback) {
                callback(false);
            }
        }
        target.page = null;
        me.prepare(source, layoutContent);
        var pageSize = me.pageSize(layoutContent);
        if (!source.firstChild) {
            if (callback) {
                callback(true);
            }
            return;
        }
        target.notified = false;
        var pageIndex = 1;
        var pageContent = null;
        if (options.usePages) {
            target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
            pageContent = target.page.var.content;
        }
        var previousWidget = null, visibleWidget = null;
        target.reflowInterval = setInterval(function () {
            for(;;) {
                var widget = source.firstChild;
                if (!widget) {
                    clearInterval(target.reflowInterval);
                    target.reflowInterval = null;
                    me.createBreak(layoutContent);
                    me.createBreak(layoutContent);
                    if (options.usePages) {
                        me.applyNumPages(layoutContent, pageIndex);
                    }
                    if (!target.notified && callback) {
                        callback(true);
                        target.notified = true;
                    }
                    me.set(target, "update");
                    break;
                }
                if(options.scrollWidget) {
                    if(visibleWidget === options.scrollWidget) {
                        if (!target.notified && callback) {
                            callback(true);
                            target.notified = true;
                        }
                        me.ui.layout.scrollToWidget(options.scrollWidget, layoutContent);
                        me.set(target, "update");
                    }
                }
                else if(options.scrollPos < layoutContent.scrollHeight) {
                    if (!target.notified && callback) {
                        callback(true);
                        target.notified = true;
                        me.set(target, "update");
                    }
                }
                var location = pageContent ? pageContent : layoutContent;
                if (widget.style && widget.style.order) {
                    location.insertBefore(widget, me.widgetByOrder(location, widget.style.order));
                } else {
                    location.appendChild(widget);
                }
                visibleWidget = widget;
                if (!target.page) {
                    break;
                }
                var newPage = false;
                if (pageContent.scrollHeight > pageContent.clientHeight || pageContent.scrollWidth > pageContent.clientWidth) {
                    newPage = true;
                }
                if (!(widget.innerHTML || widget.firstChild)) {
                    pageContent.removeChild(widget);
                    widget = null;
                }
                if (newPage) {
                    if (widget) {
                        pageContent.removeChild(widget);
                    }
                    pageIndex++;
                    target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
                    pageContent = target.page.var.content;
                    if (previousWidget && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                        pageContent.appendChild(previousWidget);
                    }
                    if (widget) {
                        pageContent.appendChild(widget);
                    }
                    for (var fontSize = 100; fontSize >= 25; fontSize -= 5) {
                        if (pageContent.scrollHeight > pageContent.clientHeight || pageContent.scrollWidth > pageContent.clientWidth) {
                            widget.style.fontSize = fontSize + "%";
                        } else {
                            break;
                        }
                    }
                    previousWidget = null;
                    me.set(target, "update");
                    break;
                } else if (widget) {
                    previousWidget = widget;
                }
            }
        }, 0);
    };
    me.widgetByOrder = function (page, order) {
        var widget = page.firstChild;
        var match = null;
        while (widget) {
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
                    "ui.basic.tag": "div",
                    "ui.theme.class": options.headerClass,
                    "ui.basic.var": "header",
                    "ui.style.width": pageWidth + "px",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "div",
                            "ui.theme.class": options.pageNumberClass,
                            "ui.basic.var": "pageNumber",
                            "ui.attribute.shortPageNumberText": pageIndex,
                            "ui.attribute.longPageNumberText": pageIndex
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.theme.class": options.scrollToTopClass,
                            "ui.basic.var": "scrollToTop",
                            "ui.touch.click": "ui.layout.scrollToTop",
                            "ui.style.opacity": pageIndex - 1 ? "1.0" : "0.0"
                        }
                    ]
                },
                {
                    "ui.basic.tag": "div",
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
    me.scrollToTop = {
        set: function (object) {
            var target = me.content(object);
            me.set(target, "widget.scrollbar.vertical.scrollTo", 0);
        }
    };
    me.applyNumPages = function (target, numPages) {
        var widget = target.firstChild;
        while (widget) {
            if (widget.var && widget.var.pageNumber) {
                var pageNumber = me.get(widget, "ui.attribute.pageNumber");
                me.set(widget.var.pageNumber, "ui.attribute.longPageNumberText", pageNumber + "/" + numPages);
            }
            widget = widget.nextSibling;
        }
    };
};
