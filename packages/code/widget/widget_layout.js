/*
 @author Zakai Hamilton
 @component WidgetLayout
 */

screens.widget.layout = function WidgetLayout(me) {
    me.move = function (source, target) {
        do {
            var widget = source.firstChild;
            if (widget) {
                target.appendChild(widget);
            }
        } while (widget);
    };
    me.clear = function (target) {
        do {
            var widget = target.firstChild;
            if (widget) {
                target.removeChild(widget);
            }
        } while (widget);
    };
    me.prepare = function (source, target) {
        do {
            var widget = target.firstChild;
            if (widget) {
                if (widget.var && widget.var.content) {
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
                    widget.var.content.parentNode.removeChild(widget.var.content);
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
        var pageHeight = container.offsetHeight;
        var pageWidth = container.parentNode.offsetWidth;
        return { width: pageWidth, height: pageHeight };
    };
    me.firstPage = function (target) {
        var page = target.firstChild;
        return page;
    };
    me.firstVisiblePage = function (target) {
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
    me.firstWidget = function (target) {
        var page = me.firstPage(target);
        if (page && page.tagName) {
            if (page.tagName.toLowerCase() === "div") {
                return page.var.content.firstChild;
            }
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
            var parent = widget.parentNode;
            while (parent) {
                if (parent.parentNode === target) {
                    me.core.property.set(target, "ui.scroll.to", parent.offsetTop);
                    break;
                }
                parent = parent.parentNode;
            }
        }
    };
    me.options = function (target) {
        return target.options;
    };
    me.reflow = function (callback, source, target, options) {
        var layoutContent = target;
        layoutContent.options = options;
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
        var showInProgress = false;
        target.reflowInterval = setInterval(function () {
            var window = me.widget.window(target);
            for (; ;) {
                var concealed = me.core.property.get(window, "conceal");
                var widget = source.firstChild;
                if (!widget || concealed) {
                    clearInterval(target.reflowInterval);
                    target.reflowInterval = null;
                    if (options.usePages) {
                        me.applyNumPages(layoutContent, pageIndex);
                    }
                    me.completePage(target.page, options);
                    if (target.page) {
                        target.page.last = true;
                        target.page.var.separator.style.display = "block";
                        target.page.var.pageNext.style.opacity = "0.0";
                        me.core.property.set(target.page.var.separator, "ui.class.add", "last");
                    }
                    me.completeReflow(callback, target, options, false);
                    me.updatePages(target);
                    break;
                }
                if (options.scrollWidget) {
                    if (visibleWidget === options.scrollWidget) {
                        showInProgress = true;
                    }
                } else if (options.scrollPos < layoutContent.scrollHeight) {
                    showInProgress = true;
                }
                var location = pageContent ? pageContent : layoutContent;
                if (widget.style && widget.style.order) {
                    location.insertBefore(widget, me.widgetByOrder(location, widget.style.order));
                } else {
                    location.appendChild(widget);
                }
                visibleWidget = widget;
                me.styleParagraph(widget, options);
                if (!target.page) {
                    if (showInProgress) {
                        me.completeReflow(callback, target, options);
                    }
                    break;
                }
                var newPage = false;
                me.cleanupWidget(widget);
                newPage = !me.widgetFitInPage(widget, target.page);
                if (widget.tagName && widget.tagName.toLowerCase() === "hr") {
                    previousWidget = null;
                }
                else if (widget.tagName && widget.tagName.toLowerCase() === "br") {
                    newPage = true;
                    widget = null;
                    previousWidget = null;
                    if (target.page) {
                        target.page.var.separator.style.display = "block";
                    }
                } else if (!(widget.textContent || widget.firstChild)) {
                    pageContent.removeChild(widget);
                    widget = null;
                    newPage = false;
                }
                if (newPage) {
                    if (widget) {
                        pageContent.removeChild(widget);
                    }
                    pageIndex++;
                    me.completePage(target.page, options);
                    target.page = me.createPage(layoutContent, pageSize.width, pageSize.height, pageIndex, options);
                    pageContent = target.page.var.content;
                    if (previousWidget && previousWidget.tagName.toLowerCase().match(/h\d/)) {
                        pageContent.appendChild(previousWidget);
                    }
                    if (widget) {
                        pageContent.appendChild(widget);
                    }
                    for (var fontSize = parseInt(target.style.fontSize); fontSize >= 8; fontSize -= 2) {
                        if (me.widgetFitInPage(null, target.page)) {
                            break;
                        }
                        target.page.style.fontSize = fontSize + "px";
                        target.page.style.lineHeight = "2em";
                    }
                    previousWidget = null;
                    me.activateOnLoad(target.page ? target.page : widget, widget);
                    if (showInProgress) {
                        me.completeReflow(callback, target, options);
                    }
                    me.core.property.set(target, "update");
                    break;
                } else if (widget) {
                    previousWidget = widget;
                    me.activateOnLoad(target.page ? target.page : widget, widget);
                }
            }
        }, 0);
    };
    me.widgetFitInContainer = function (widget, container) {
        var result = true;
        if (container.scrollWidth > container.offsetWidth) {
            result = false;
        }
        if (container.scrollHeight > container.offsetHeight) {
            result = false;
        }
        return result;
    };
    me.widgetFitInPage = function (widget, page) {
        var pageContent = page.var.content;
        var pageContainer = page.var.container;
        var result = true;
        result = me.widgetFitInContainer(widget, page);
        result = result && me.widgetFitInContainer(widget, pageContainer);
        result = result && me.widgetFitInContainer(widget, pageContent);
        return result;
    };
    me.completeReflow = function (callback, target, options, scrollToWidget = true) {
        if (!target.notified && callback) {
            callback(true);
            target.notified = true;
            if (options.scrollWidget && scrollToWidget) {
                me.scrollToWidget(options.scrollWidget, target);
            }
            me.core.property.set(target, "update");
        }
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
        var page = me.ui.element({
            "ui.basic.tag": "div",
            "ui.class.class": options.pageClass,
            "ui.style.width": pageWidth + "px",
            "ui.style.height": pageHeight + "px",
            "ui.style.visibility": "hidden",
            "ui.attribute.pageNumber": pageIndex,
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.headerClass,
                    "ui.basic.var": "header",
                    "ui.style.width": pageWidth + "px",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.pageReloadClass,
                            "ui.basic.var": "pageReload",
                            "ui.touch.click": options.reloadMethod
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.pageFullscreenClass,
                            "ui.basic.var": "pageFullscreen",
                            "ui.touch.click": options.fullscreenMethod
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.pageNumberClass,
                            "ui.basic.var": "pageNumber",
                            "ui.attribute.shortPageNumberText": pageIndex,
                            "ui.attribute.longPageNumberText": pageIndex
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.scrollToTopClass,
                            "ui.basic.var": "scrollToTop",
                            "ui.touch.click": "widget.layout.scrollToTop",
                            "ui.style.opacity": pageIndex - 1 ? "1.0" : "0.0"
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.previousPageClass,
                            "ui.basic.var": "pagePrevious",
                            "ui.touch.click": options.previousPageMethod,
                            "ui.style.opacity": pageIndex - 1 ? "1.0" : "0.0"
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": options.nextPageClass,
                            "ui.basic.var": "pageNext",
                            "ui.touch.click": options.nextPageMethod
                        }
                    ]
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.containerClass,
                    "ui.basic.var": "container",
                    "ui.style.overflow": "hidden",
                    "ui.basic.elements": {
                        "ui.basic.tag": "div",
                        "ui.class.class": options.contentClass,
                        "ui.style.columns": options.columnCount + " " + options.columnWidth,
                        "ui.basic.var": "content"
                    }
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.separatorClass,
                    "ui.basic.var": "separator",
                    "ui.style.display": "none"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.rewindClass,
                    "ui.basic.var": "rewind",
                    "ui.touch.click": options.rewindMethod,
                    "ui.basic.show": options.playEnabled
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.playClass,
                    "ui.basic.var": "play",
                    "ui.touch.click": options.playMethod,
                    "ui.basic.show": options.playEnabled
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.fastforwardClass,
                    "ui.basic.var": "fastforward",
                    "ui.touch.click": options.fastforwardMethod,
                    "ui.basic.show": options.playEnabled
                },
                {
                    "ui.basic.tag": "div",
                    "ui.class.class": options.stopClass,
                    "ui.basic.var": "stop",
                    "ui.touch.click": options.stopMethod,
                    "ui.basic.show": options.playEnabled
                }
            ]
        }, target, "self");
        page.options = options;
        return page;
    };
    me.createBreak = function (target) {
        var page = me.ui.element({
            "ui.basic.tag": "br"
        }, target);
        return page;
    };
    me.scrollToTop = {
        set: function (object) {
            me.core.property.set(object, "ui.scroll.to", 0);
        }
    };
    me.applyNumPages = function (target, numPages) {
        var widget = target.firstChild;
        while (widget) {
            if (widget.var && widget.var.pageNumber) {
                var pageNumber = me.core.property.get(widget, "ui.attribute.pageNumber");
                me.core.property.set(widget.var.pageNumber, "ui.attribute.longPageNumberText", pageNumber + "/" + numPages);
            }
            widget = widget.nextSibling;
        }
    };
    me.widgetMatch = function (widget, options) {
        var match = false;
        if (!options.filter) {
            return false;
        }
        match = widget.textContent.toUpperCase().includes(options.filter.toUpperCase());
        return match;
    };
    me.styleParagraph = function (widget, options) {
        if (widget && widget.style) {
            widget.style.display = "flex-inline";
            if (!options.usePages) {
                if (options.filter && !me.widgetMatch(widget, options)) {
                    widget.style.display = "none";
                }
            }
            var parentMatch = options.filter && me.widgetMatch(widget, options);
            var child = widget.firstChild;
            while (child) {
                if (child.style) {
                    child.style.fontWeight = "";
                    child.style.backgroundColor = "";
                }
                child = child.nextSibling;
            }
            if (parentMatch) {
                me.ui.mark.widget(widget, options.filter);
            }
            else {
                me.ui.mark.widget(widget, null);
            }
            var child = widget.firstChild;
            while (child) {
                if (child.tagName && child.tagName.toLowerCase === "mark") {
                    child = child.nextSibling;
                    continue;
                }
                if (child.style) {
                    me.ui.mark.widget(child, null);
                    if (options.filter && me.widgetMatch(child, options)) {
                        child.style.fontWeight = "bold";
                        child.style.backgroundColor = "#FFFF00";
                    }
                }
                child = child.nextSibling;
            }
        }
    };
    me.completePage = function (page, options) {
        var showPage = true;
        if (!page) {
            return;
        }
        if (options.filter) {
            var widget = page.var.content.firstChild;
            var found = false;
            while (widget) {
                if (me.widgetMatch(widget, options)) {
                    found = true;
                    break;
                }
                widget = widget.nextSibling;
            }
            if (!found) {
                showPage = false;
            }
        }
        var pageNumber = me.core.property.get(page, "ui.attribute.pageNumber");
        if (pageNumber === "1" || showPage) {
            page.style.display = "flex-inline";
            page.style.visibility = "visible";
            page.pageOffset = page.offsetTop;
            page.pageSize = page.clientHeight;
        } else {
            page.style.display = "none";
        }
        me.clearPage(page);
    };
    me.pageInView = function (page, partial = true) {
        let parentTop = page.parentNode.scrollTop;
        let parentBottom = parentTop + page.parentNode.clientHeight;
        let childTop = page.pageOffset;
        let childBottom = childTop + page.pageSize;
        let isTotal = (childTop >= parentTop && childBottom <= parentBottom);
        let isPartial = partial && ((childBottom > parentTop) ||
            (childTop < parentBottom));
        return (isTotal || isPartial);
    };
    me.pageApply = function (target, callback) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                callback(child);
            }
            child = child.nextSibling;
        }
    };
    me.updatePages = function (target) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                var pageInView = me.pageInView(child);
                var childInView = child.inView || false;
                if (pageInView !== childInView) {
                    if (pageInView) {
                        child.var.content.style.display = "";
                        child.style.visibility = "visible";
                    } else {
                        child.var.content.style.display = "none";
                        child.style.visibility = "hidden";
                    }
                    child.inView = pageInView;
                }
            }
            child = child.nextSibling;
        }
    };
    me.activateOnLoad = function (parent, widget) {
        if (!widget) {
            return;
        }
        var child = widget.firstChild;
        while (child) {
            me.activateOnLoad(parent, child);
            child = child.nextSibling;
        }
        if (widget && widget.getAttribute) {
            var onload = widget.getAttribute("onload");
            if (onload) {
                me.core.property.set(parent, onload);
            }
        }
    };
    me.cleanupWidget = function (widget) {
        var child = widget.firstChild;
        while (child) {
            if (child.tagName && child.tagName.toLowerCase() === "div") {
                widget.removeChild(child);
                child = widget.firstChild;
            }
            if (child) {
                child = child.nextSibling;
            }
        }
        widget.style.border = "1px solid transparent";
    };
    me.currentPage = function (target) {
        var child = target.firstChild;
        while (child) {
            if (child.pageSize) {
                var pageInView = me.pageInView(child, false);
                if (pageInView) {
                    return child;
                }
            }
            child = child.nextSibling;
        }
        return null;
    };
    me.pageText = function (page) {
        var content = page.var.content;
        var array = Array.from(content.children).map(el => {
            if (el.getAttribute("hidden")) {
                return "";
            }
            var text = el.innerText;
            return text;
        });
        return array;
    };
    me.isPlaying = function (page) {
        var isPlaying = me.core.property.get(page.var.play, "ui.class.contains", "play");
        return isPlaying;
    };
    me.isPaused = function (page) {
        var isPaused = me.core.property.get(page.var.play, "ui.class.contains", "pause");
        return isPaused;
    };
    me.setPlayState = function (page, play, pause) {
        var widgets = [page.var.play, page.var.stop, page.var.rewind, page.var.fastforward];
        if (play) {
            me.core.property.set(widgets, "ui.class.add", "play");
        } else {
            me.core.property.set(widgets, "ui.class.remove", "play");
        }
        if (pause) {
            me.core.property.set(widgets, "ui.class.add", "pause");
        } else {
            me.core.property.set(widgets, "ui.class.remove", "pause");
        }
    };
    me.hasSeparator = function (page) {
        var hasSeparator = false;
        if (page) {
            if (page.var.separator.style.display !== "none") {
                hasSeparator = true;
            }
        }
        return hasSeparator;
    };
    me.markElement = function (element, mark) {
        if (mark) {
            element.style.color = "";
        }
        else {
            element.style.color = "rgba(0,0,0,0.5)";
        }
    };
    me.clearPage = function (page) {
        var content = page.var.content;
        Array.from(content.children).map(element => {
            if (element.getAttribute('hidden')) {
                return;
            }
            me.markElement(element, true);
            if (element.innerText) {
                me.core.property.set(element, page.options.widgetProperties);
            }
            element.classList.remove("mark");
        });
        page.focusElement = null;
    };
    me.markPage = function (page, index, text) {
        var content = page.var.content;
        var focusElement = null;
        focusElement = content.children[index];
        Array.from(content.children).map(element => {
            if (element.getAttribute('hidden')) {
                return;
            }
            if (element === focusElement) {
                return;
            }
            me.markElement(element, false);
        });
        if (page.focusElement !== focusElement) {
            if (page.focusElement) {
                me.markElement(page.focusElement, false);
                page.focusElement.classList.remove("mark");
            }
            if (focusElement) {
                me.markElement(focusElement, true);
                focusElement.classList.add("mark");
            }
            page.focusElement = focusElement;
        }
    };
    me.focusElement = function (page) {
        return page.focusElement;
    };
};
