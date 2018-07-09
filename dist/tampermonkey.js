// ==UserScript==
// @name         Hubberdashery
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Some hackdashery for your githubz.
// @author       Space Monkey Extraordinaire!
// @match        https://github.com/*
// @grant        none
// ==/UserScript==
(function() {
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var 
    PullRequestsHack = require("./pull-requests-hack"),
    PullRequestPagerHack = require('./pull-requests-pager'),
    PullRequestCommentHack = require('./pull-request-show-all-comments');

var hacks = [
    PullRequestsHack, 
    PullRequestPagerHack,
    PullRequestCommentHack];

var runningHacks = [];

var executeHacks = function(){
    var path = window.location.pathname;
    console.info('hubbery dashery - executing matchers for ' + path);
    runningHacks.forEach(x => x.destroy());
    var available = hacks.filter(h => path.match(h.urlMatch));
    runningHacks = available.map(a => new (a));
}

var currentPath = "";
window.setInterval(function(){
        if (currentPath == window.location.pathname){
            return;
        }
        console.info('hubbery dashery - detected url change');
        window.setTimeout(executeHacks, 0);
        currentPath = window.location.pathname;
    }, 1000);
},{"./pull-request-show-all-comments":4,"./pull-requests-hack":5,"./pull-requests-pager":6}],2:[function(require,module,exports){
function FilenameFilter(filterText) {
    this._filterText = filterText;
}
FilenameFilter.prototype = {
    filter: function () {
        var value = this._filterText.trim();
        var filters = value.split(",")
            .map(part => this.makeFilterFor(part))
            .filter(re => re);

        var files = Array.from(document.querySelectorAll("div.file"));
        var visibleCount = files.length;
        var counterEl = document.querySelector("#files_tab_counter");
        counterEl.innerText = visibleCount;
        counterEl.style.border = "";
        return files.reduce((acc, cur) => {
            return acc.then(() => {
                var fileName = Array.from(cur.querySelectorAll("a"))
                    .filter(a => a.href.indexOf("#diff") >= 0)
                    .map(a => a.innerText)[0];

                var display = filters.length === 0 || filters.reduce((acc2, cur2) => {
                    return acc2 || this.matches(fileName, cur2);
                }, false);

                cur.style.display = display ? "" : "none";
                if (!display) {
                    visibleCount--;
                    counterEl.innerText = visibleCount;
                }
                counterEl.style.border = "1px solid red";
            });
        }, new Promise((resolve, reject) => resolve()));
    },
    matches: function (str, filter) {
        var isMatch = str.match(filter.re);
        return filter.match ? isMatch : !isMatch;
    },
    makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }
            if (trimmed[0] === "/" && trimmed.split("/").length > 2) {
                // raw regex
                return { re: new RegExp(trimmed), match: true };
            }
            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this.looksLikeFileExtensionFilter(trimmed)
                ? new RegExp("." + trimmed + "$")
                : new RegExp(trimmed);
            return {
                re: re,
                match: match
            };
        } catch (e) { /* ignore: filter is probably incomplete */ }
    },

    looksLikeFileExtensionFilter: function (filter) {
        var parts = filter.split(".");
        return filter === "*" || parts.length === 2 &&
            parts[0] === "*";
    },
};

module.exports = FilenameFilter;
},{}],3:[function(require,module,exports){
function FilenameFilterLite(filterText) {
    this._filterText = filterText || "";
}
FilenameFilterLite.prototype = {
    filter: function (fileElements) {
        var filters = this._filterText.trim().split(",")
            .map(part => this.makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var positiveFilters = filters.filter(f => f.match);
            var negativeFilters = filters.filter(f => !f.match);
            const includedByPositiveFilters = positiveFilters.length === 0 ||
                positiveFilters.reduce((acc2, filter) => {
                    return acc2 || file.match(filter.re)
                }, false);
            const negativeFilterMatch = negativeFilters.length === 0 
            ? false
            : negativeFilters.reduce((acc2, filter) => {
                return acc2 || !!file.match(filter.re)
            }, false);
            return includedByPositiveFilters && !negativeFilterMatch;
        });
    },
    matches: function (str, filter) {
        var isMatch = str.match(filter.re);
        return filter.match ? isMatch : !isMatch;
    },
    makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }
            // if (trimmed[0] === "/" && trimmed.split("/").length > 2) {
            //     // raw regex
            //     return { re: new RegExp(trimmed), match: true };
            // }
            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this.looksLikeFileExtensionFilter(trimmed)
                ? new RegExp("." + trimmed + "$")
                : new RegExp(trimmed);
            return {
                re: re,
                match: match
            };
        } catch (e) { 
            console.log(`ignoring filter '${text}'`, e.toString());
            /* ignore: filter is probably incomplete */ 
        }
    },

    looksLikeFileExtensionFilter: function (filter) {
        var parts = filter.split(".");
        return filter === "*" || parts.length === 2 &&
            parts[0] === "*";
    }
};


module.exports = FilenameFilterLite;
},{}],4:[function(require,module,exports){
function ExpandCommentsHack() {
    this.init();
};

ExpandCommentsHack.prototype = {
    destroy: function(){
    },
    init: function(){

        var headerActionsEl = document.getElementsByClassName('gh-header-actions');
        if (headerActionsEl.length == 0) {
            // element not available, poll
            window.setTimeout(this.init.bind(this), 1000);
            return;
        }

        var btnExpandComments = document.createElement("button");
        btnExpandComments.classList.add("btn");
        btnExpandComments.classList.add("btn-sm");
        btnExpandComments.classList.add("js-detials-target");
        btnExpandComments.innerHTML = "Expand Comments";
        
        var btnContainer = headerActionsEl[0];
        btnContainer.insertBefore(
            btnExpandComments, 
            btnContainer.firstChild);

        var loadMore = function () {
            var loadMoreButtons = document.getElementsByClassName('ajax-pagination-btn');

            Array
                .from(loadMoreButtons)
                .forEach(x => window.setTimeout(x.click.bind(x), 0));


            return loadMoreButtons.length;
        };

        var expandAllComments = function () {
            var outdatedButtons =
                Array
                    .from(document.getElementsByTagName('BUTTON'))
                    .filter(x =>
                        x.className.indexOf('show-outdated-button') > -1
                        && x.offsetParent != null // visible
                    );
            outdatedButtons.forEach(x => window.setTimeout(x.click.bind(x), 0));
        };

        var updateButtonStatus = function(val){
            btnExpandComments.innerHTML = val;
        };

        var getTitle = function () {
            var titleEls = document.getElementsByClassName('js-issue-title');
            if (titleEls.length > 0) {
                return titleEls[0]
            }
            return null;
        };

        var continouslyCheckInAndLoad = function () {
            updateButtonStatus('⏳ Expanding');
            var loadingCount = loadMore();
            var loadedStuff = loadingCount > 0;
            if (loadedStuff) {
                updateButtonStatus('⏳ Expanding #' + loadingCount);
                window.setTimeout(continouslyCheckInAndLoad, 1000);
            } else {
                expandAllComments();
                updateButtonStatus('✅ Expanded');
            }
        };

        btnExpandComments.onclick = continouslyCheckInAndLoad;
    }
};

ExpandCommentsHack.urlMatch = /.*\/pull\/[\d]+$/;
module.exports = ExpandCommentsHack;
},{}],5:[function(require,module,exports){
var 
    FilenameFilter = require("./filename-filter-old")
    FilenameFilterLite = require("./filename-filter");

function PullRequestsHack() {
    this._waited = 0;
    this.init();
}
PullRequestsHack.urlMatch = /.*\/pull\/.*/;
PullRequestsHack.prototype = {
    destroy: function(){
    },
    init: function () {
        var menuButton = this.createExtendedMenuButton();
        if (!menuButton) {
            this.log("no hubberdashery on this page...");
            return;
        }
        var menuContainer = this.createExtendedMenuLinkedTo(menuButton);
        var tempItem = this.mkEntryContainer(menuContainer);
        tempItem.innerText = "page loading... please wait";
        window.addEventListener("load", () => {
            tempItem.remove();
            this.addLoadAllDiffsTo(menuContainer);
            this.addExpansionButtonTo(menuContainer);
            this.addFilesFilterTo(menuContainer);
        });
    },
    addExpansionButtonTo: function (container) {
        var buttonContainer = this.mkEntryContainer(container);
        var button = this.mkButton("Expand all diffs contexts", {
            attributes: {
                title: "Expands all context around diff areas (ie, blue lines)"
            },
            click: function expandAll() {
                var expanders = Array.from(document.querySelectorAll("a.diff-expander"));
                expanders.forEach(e => e.click());
                if (expanders.length) {
                    window.setTimeout(expandAll, 0);
                }
            }
        }, { id: "expand-all" });
        buttonContainer.appendChild(button);
    },

    mkDiv: function () {
        return this.mkEl("div");
    },

    mkButton: function (text, eventHandlers, attributes) {
        return this.mkEl("button", {
            cssClasses: ["btn", "btn-sm", "btn-outline"],
            eventHandlers: eventHandlers,
            attributes: attributes,
            text: text
        });
    },

    mkEl: function (tag, options) {
        options = options || {};
        var cssClasses = options.cssClasses || [];
        var attributes = options.attributes || {};
        var eventHandlers = options.eventHandlers || {};

        var el = document.createElement(tag);
        cssClasses.forEach(c => el.classList.add(c));

        Object.getOwnPropertyNames(eventHandlers).forEach(eventName => {
            el.addEventListener(eventName, eventHandlers[eventName]);
        });

        Object.getOwnPropertyNames(attributes).forEach(attrib => {
            var parts = attrib.split(".");
            var lead = parts.slice(0, parts.length - 1);
            var obj = lead.reduce((acc, cur) => {
                return acc ? acc[cur] : acc;
            }, el);
            var src = attributes[attrib];
            if (typeof src === "object") {
                Object.getOwnPropertyNames(src).forEach(prop => {
                    obj[attrib][prop] = src[prop];
                });
            } else {
                obj[attrib] = attributes[attrib];
            }
        });
        if (options.text) {
            el.innerText = options.text;
        }
        return el;
    },

    createExtendedMenuButton: function () {
        var container = document.querySelector("div.pr-review-tools");
        if (!container) {
            this.log("Unable to find pr-review-tools div");
            return;
        }
        var menuButton = this.mkButton("▼", {}, { id: "hubberdashery-more", "style.marginLeft": "5px" });
        container.appendChild(menuButton);
        return menuButton;
    },

    createExtendedMenuLinkedTo: function (button) {
        var buttonRect = button.getClientRects()[0];
        if (!buttonRect) {
            this.log("Unable to get client rect for menu button");
        }
        var menuDiv = this.mkEl("div", {
            attributes: {
                style: {
                    position: "absolute",
                    top: this.px(buttonRect.top + buttonRect.height),
                    right: this.px(20),
                    display: "none",
                    background: "#fff",
                    padding: "3px",
                    border: "1px solid #ccc",
                    borderRadius: "2px",
                    zIndex: 999
                }
            }
        });
        button.addEventListener("click", () => {
            var display = menuDiv.style.display === "none"
                ? "inline-block"
                : "none";
            menuDiv.style.display = display;
            button.innerText = button.innerText === "▼" ? "▲" : "▼";
        });
        document.body.appendChild(menuDiv);
        return menuDiv;
    },

    px: function (num) {
        return (num || 0) + "px";
    },

    log: function () {
        var args = ["Hubberdashery: "].concat(Array.from(arguments));
        console.log.apply(console, args);
    },

    refilter: function () {
        var filters = [
            new FilenameFilter(this._fileNameEntry.value)
        ];
        var files = this.createFileElements();
        // TODO: pick up from here: should filter with each filter and then do visibility
    },
    addFilesFilterTo: function (container) {
        var localContainer = this.mkEntryContainer(container);
        var label = this.mkLabel("Filter:");
        var tip = "Enter comma-separated regex filters. Simple file extension globbing is also supported.";
        var placeHolder = "eg: \"*.cs, Test\"";
        var timer;
        this._fileNameEntry = this.mkEl("input", {
            attributes: {
                style: {
                    borderRadius: "3px",
                    borderColor: "#eee",
                    borderStyle: "solid",
                    borderWidth: "1px",
                    marginLeft: "5px"
                },
                placeholder: placeHolder,
                title: tip
            },
            eventHandlers: {
                keyup: () => {
                    if (timer) {
                        window.clearTimeout(timer);
                    }
                    timer = window.setTimeout(() => {
                        this.wait();
                        var util = new FilenameFilter(this._fileNameEntry.value);
                        util.filter()
                            .then(() => this.unwait())
                            .catch(e => {
                                alert("filter fails: " + e);
                                this.unwait();
                            });
                    }, 500);
                }
            }
        });
        localContainer.appendChild(label);
        localContainer.appendChild(this._fileNameEntry);
    },
    addLoadAllDiffsTo: function (container) {
        var local = this.mkEntryContainer(container);
        var button = this.mkButton("Load all diffs...", {
            attributes: {
                title: "Loads all lazily-loaded diffs"
            },
            eventHandlers: {
                click: () => {
                    this.wait();
                    Array.from(document.querySelectorAll("button.load-diff-button"))
                        .reduce((acc, cur) => {
                            return acc.then(() => {
                                cur.click();
                            });
                        }, new Promise((resolve, reject) => resolve()))
                        .then(() => this.unwait());
                }
            }
        });
    },
    addCleanupsFilterTo: function (container) {
    },

    wait: function () {
        this._waited++;
        if (this._waited) {
            document.body.style.cursor = "wait";
        }
    },

    unwait: function () {
        this._waited--;
        if (this._waited <= 0) {
            document.body.style.cursor = "";
            this._waited = 0;
        }
    },

    mkEntryContainer: function (parent) {
        var result = this.mkEl("div", {
            attributes: {
                style: {
                    marginTop: "3px",
                    marginBottom: "3px",
                    textAlign: "right"
                }
            }
        });
        if (parent) {
            parent.appendChild(result);
        }
        return result;
    },

    mkLabel: function (text) {
        var label = document.createElement("label");
        label.innerText = text;
        return label;
    },

    createFileElements: function () {
        return Array.from(document.querySelectorAll("div.file"))
            .map(el => {
                var fileName = Array.from(el.querySelectorAll("a"))
                    .filter(a => a.href.indexOfi("#diff") >= 0)
                    .map(a => a.innerText)[0];
                return {
                    el: el,
                    fileName: fileName
                };
            });
    }
};

module.exports = PullRequestsHack;
},{"./filename-filter":3,"./filename-filter-old":2}],6:[function(require,module,exports){
function PullRequestPagerHack() {
    this.init();
};

PullRequestPagerHack.prototype = {
    destroy: function(){
        debugger;
        if (this.timerHandle){
            clearInterval(this.timerHandle);
        }
        if (this.container){
            this.container.parentNode.removeChild(this.container);
        }
    },
    init : function(){
        var files = document.getElementsByClassName('file');
        var pageSize = 10;
        var pageCount = files.length / pageSize;
        var selectedPageIndex = 0;
        var pageContainer = null;
        var expectedFileCount = parseInt(document.getElementById('files_tab_counter').innerText);
        var timerHandle = null;
    
        console.info(`expanding ${expectedFileCount} files`);
    
        var width = function(){
           return window.innerWidth 
               || document.documentElement.clientWidth 
               || document.body.clientWidth 
               || 0;
        };
    
        var height = function(){
               return window.innerHeight 
               || document.documentElement.clientHeight 
               || document.body.clientHeight 
               || 0;
        }
    
        var isFileContentExpanded = function(file){
            return file.className.match(/\sopen\s/g) == null;
        };
    
        var toggleFileContents = function(file){
            var expanderButton = file.getElementsByClassName('js-details-target')[0];
            window.setTimeout(expanderButton.click.bind(expanderButton),0);
        };
    
        var collapseFileContent = function(file){
            if (!isFileContentExpanded(file)){
                return;
            }
            toggleFileContents(file);
        };
    
        var attachFileInfoExpandCollapseEvent = function(file){
            if (file._hasAttachedExpandCollapseEvent){
                return;
            }
    
            var header = file.getElementsByClassName('file-info')[0];
            header.addEventListener('click', (e) => toggleFileContents(file, e));
            header.style.cursor = 'pointer';
            file._hasAttachedExpandCollapseEvent = true;
        };
    
        var areAllFilesLoaded = function(files){
            var allLoaded = files.length == expectedFileCount;
            if (allLoaded){
                return true;
            }

            // if not matching, then we have to investigate a bit deeper
            if (files.length > 0){
                var lastFile = files[files.length - 1];
                return lastFile.nextElementSibling == null;
            }

            return false;
        };
    
        var showPage = function(pageIndex){
            selectedPageIndex = pageIndex;
    
            var startFileIndex = pageIndex * pageSize;
            var endFileIndex = startFileIndex + pageSize;
            for(var fileIndex = 0; fileIndex < files.length; fileIndex++){
                var show = fileIndex >= startFileIndex && fileIndex < endFileIndex;
                var file = files[fileIndex];
                file.style.display = show ? 'block' : 'none';
    
                if (show){
                    if (!file._hasContentLoaded){
                        // check if the contents need to be expanded
                        file._hasContentLoaded = true;
                        var includeFragments = Array.from(file.getElementsByTagName('INCLUDE-FRAGMENT'));
                        if (includeFragments.length > 0){
                            includeFragments.forEach(x => {
                                var buttons = x.getElementsByTagName('BUTTON');
                                var loadMoreBtn = buttons.length > 0 ? buttons[0] : null;
                                if (loadMoreBtn){
                                    window.setTimeout(loadMoreBtn.click.bind(loadMoreBtn), 0);
                                }
                            });
                        }
                    }

                    //collapseFileContent(file);
                    //attachFileInfoExpandCollapseEvent(file);
                }
            }
        };
    
        var lastFileCount = 0;
    
        var updatePageOptions = function(){
            files = document.getElementsByClassName('file');
            var fileCount = files.length;
    
            if (lastFileCount === fileCount){
                // no need to update
                return; 
            }
    
            pageCount = Math.ceil(fileCount / pageSize);
    
            // add options
            var optionsHtml = [];
            var pageStart = 0;
            for(var i = 0; i < pageCount; i++){
                var pageEnd = pageStart + pageSize;
                if (pageEnd > fileCount){
                    pageEnd = fileCount;
                }
    
                optionsHtml.push(`<option data-page='${i}' value='${i}' style='padding:8px; border: 1px solid #d9d9d9; cursor: pointer;'>Files: ${pageStart + 1} - ${pageEnd}</option>`);
                pageStart += pageSize;
            }
    
            var selectList = document.getElementById('hb-pager-select');
            selectList.innerHTML = optionsHtml.join('\r\n');
            lastFileCount = fileCount;
    
            if (areAllFilesLoaded(files)){
                if (timerHandle){
                    clearInterval(timerHandle);
                }
    
                // enable controls
                var ids = ['hb-pager-prev', 'hb-pager-select', 'hb-pager-next'];
                ids.forEach(x => document.getElementById(x).disabled = false);
                showPage(0);
            }
        };
    
        var centerContainerOnScreen = function(container){
            container.style.left = (width()/2 - (container.offsetWidth/2)) + "px";
            container.style.top = (height() - container.offsetHeight - 20) + "px";
        };
    
        var createSelectPager = function(){
            // create the static container
            pageContainer = document.createElement('div')
            pageContainer.id = 'hb-pager';
            pageContainer.style.position = "fixed";
            pageContainer.style.top = "0px";
            pageContainer.style.left = "-1000px";
            pageContainer.style.margin = '0px';
            pageContainer.style.zIndex = '99999';
            pageContainer.style.backgroundColor = 'transparent';
            document.getElementsByTagName('body')[0].appendChild(pageContainer);
    
            console.info('building up hubber dashery pager links');
            var pagerHtml = [];
            pagerHtml.push(`<button id='hb-pager-prev' disabled='disabled' class="btn btn-sm btn-outline">&#8592;</button>`);
            pagerHtml.push('&nbsp;');
            pagerHtml.push(`<select id='hb-pager-select' disabled='disabled' class='btn-outline' style='border:2px solid grey; width:150px; height:30px; padding:8px; border: 1px solid #d9d9d9; cursor: pointer; text-align-last:center'>`);
            pagerHtml.push('</select>');
            pagerHtml.push('&nbsp;');
            pagerHtml.push(`<button id='hb-pager-next' disabled='disabled' class="btn btn-sm btn-outline">&#8594;</button>`);
            
            pageContainer.innerHTML = pagerHtml.join('');
            document.getElementById('hb-pager-select').addEventListener('change', onPageChangeHandler);
    
            var changeSelectedPage = (delta) =>{
                var newPage = selectedPageIndex + delta;
                if (newPage < 0 || newPage >= pageCount){
                    return;
                }
                document.getElementById("hb-pager-select").selectedIndex = newPage;
                showAndScrollToPage(newPage);
            }
            document.getElementById('hb-pager-prev').addEventListener('click', () => changeSelectedPage(-1));
            document.getElementById('hb-pager-next').addEventListener('click', () => changeSelectedPage(1));
            updatePageOptions();	
            centerContainerOnScreen(pageContainer);
        };
    
        var showAndScrollToPage = function(page){
            if (page < 0 || page >= pageCount){
                return;
            }
            showPage(parseInt(page));
            window.scrollTo(0, 0);
        }
    
        var onPageChangeHandler = function(e){
            var page = e.target.value;
            showAndScrollToPage(page);
        };
    
        window.addEventListener("resize", function(event) {
            centerContainerOnScreen(pageContainer);
        });
    
        var hiddenFragments = document.getElementsByTagName('INCLUDE-FRAGMENT');
        hiddenFragments[hiddenFragments.length - 1].scrollIntoView();
        window.scrollTo(0,0);
    
        createSelectPager();
        timerHandle = window.setInterval(updatePageOptions, 3000);

        this.timerHandle = timerHandle;
        this.container = pageContainer;
    }
};

PullRequestPagerHack.urlMatch = /.*\/pull\/.*\/files.*/;
module.exports = PullRequestPagerHack;
},{}]},{},[1])
})();