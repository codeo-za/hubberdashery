// ==UserScript==
// @name         Hubberdashery
// @namespace    http://tampermonkey.net/
// @version      0.10
// @description  Some hackdashery for your githubz.
// @author       Space Monkey Extraordinaire!
// @match        https://github.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
console.log(" --- Hubberdashery loaded ---");
var PullRequestsHack = require("./pull-requests-hack"),
    PullRequestPagerHack = require("./pull-requests-pager"),
    PullRequestCommentHack = require("./pull-request-show-all-comments"),
    TrelloSidebarHack = require("./trello-sidebar-hack");

var hacks = [
    PullRequestsHack,
    PullRequestPagerHack,
    PullRequestCommentHack,
    TrelloSidebarHack
];

var runningHacks = [],
    badgeElementId = "hubberdashery-hack-count-badge";

function listHacksForPage() {
    var path = window.location.pathname;
    return hacks.filter(h => path.match(h.urlMatch));
}

function executeHacks() {
    var path = window.location.pathname;
    console.info("Hubberdashery - executing matchers for " + path);
    runningHacks.forEach(x => x.destroy());
    var available = listHacksForPage();
    runningHacks = available.map(a => new a());
}

function addBadgeFor(count) {
    var el = document.createElement("span");
    el.innerText = count;
    el.title = count + " hacks will run when the document has loaded";
    el.id = badgeElementId;
    var style = {
        display: "inline-block",
        background: "red",
        marginTop: "16px",
        marginLeft: "-6px",

        borderStyle: "solid",
        borderWidth: "1px",
        borderRadius: "100%",
        borderColor: "white",

        width: "16px",
        height: "16px",
        fontSize: "12px",
        lineHeight: "13px",
        textAlign: "center"
    };

    Object.keys(style).forEach(k => {
        el.style[k] = style[k];
    });

    addBadgeToOcticon(el);
}

function addBadgeToOcticon(badge) {
    var target = document.querySelector(".octicon");
    if (target) {
        window.setTimeout(() => target.parentElement.appendChild(badge), 0);
        return;
    }
    window.setTimeout(() => addBadgeToOcticon(badge), 1000);
}

function displayHacksAvailable() {
    var available = listHacksForPage();
    console.log(
        available.length +
            " hacks available... waiting for full window load to run them"
    );
    if (available.length) {
        addBadgeFor(available.length);
    }
}

function refreshHacksOnPathChange() {
    window.setInterval(function() {
        if (currentPath == window.location.pathname) {
            return;
        }
        console.info("Hubberdashery - detected url change");
        window.setTimeout(executeHacks, 0);
        currentPath = window.location.pathname;
    }, 1000);
}

function removeBadge() {
    var badge = document.getElementById(badgeElementId);
    if (badge) {
        badge.remove();
    }
}

function reloadHacks() {
    runningHacks.forEach(x => x.destroy());
    runningHacks.forEach(x => {
        if (typeof x["init"] == "function") {
            x.init();
        }
    });
}
window.__reload_hacks = reloadHacks;

var currentPath = "";
if (document.readyState === "complete") {
    console.log(
        "Hubberdashery late loading -- for load progress, set '@run-at start' on this script"
    );
    executeHacks();
    currentPath = window.location.pathname;
    refreshHacksOnPathChange();
} else {
    console.log("eager loading engaged!");
    displayHacksAvailable();
    window.addEventListener("load", function() {
        console.log("Running hax");
        currentPath = window.location.pathname;
        [removeBadge, executeHacks, refreshHacksOnPathChange].forEach(func => {
            try {
                func();
            } catch (e) {
                console.error(e);
            }
        });
    });
}

},{"./pull-request-show-all-comments":5,"./pull-requests-hack":6,"./pull-requests-pager":7,"./trello-sidebar-hack":8}],2:[function(require,module,exports){
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
const simpleFilterChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.*";
function FilenameFilterLite(filterText) {
    this._filterText = filterText || "";
}
FilenameFilterLite.prototype = {
    filter: function (fileElements) {
        var filters = this._filterText.trim().split(",")
            .map(part => this._makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var positiveFilters = filters.filter(f => f.match);
            var negativeFilters = filters.filter(f => !f.match);
            const includedByPositiveFilters = positiveFilters.length === 0 ||
                positiveFilters.reduce((acc2, filter) => {
                    return acc2 || file.fileName.match(filter.re)
                }, false);
            const negativeFilterMatch = negativeFilters.length === 0
                ? false
                : negativeFilters.reduce((acc2, filter) => {
                    return acc2 || !!file.fileName.match(filter.re)
                }, false);
            return includedByPositiveFilters && !negativeFilterMatch;
        });
    },
    _makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }

            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this._looksLikeSimpleFilter(trimmed)
                ? new RegExp(`\.${trimmed.replace(".", "\\.").replace("*", ".*")}$`)
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

    _escapeRegexCharacters: function(str) {
    },

    _looksLikeSimpleFilter: function (filter) {
        // filter is simple if it only contains alphanumerics, periods & wildcard (*)
        const result = Array.from(filter).reduce(
            (a, c) => a && simpleFilterChars.indexOf(c) > -1,
            true);
        return result;
    }
};


module.exports = FilenameFilterLite;
},{}],4:[function(require,module,exports){
"use strict";

function addItemsToSidebar(headingText, contentArray) {
    if (!Array.isArray(contentArray)) {
        contentArray = [contentArray];
    }

    var container = createContainerInDiscussionSidebar();
    if (!container) {
        return;
    }

    console.debug("have side-bar container: ", container);

    container.appendChild(createHeading(headingText));

    contentArray.forEach(content => {
        var element = createItemElementFor(content);
        console.debug("have content element: ", element);
        container.appendChild(element);
    });
}

function createItemElementFor(htmlContent) {
    // Create the content
    var contentContainer = document.createElement("div");
    contentContainer.innerHTML = htmlContent;

    // Create the sidebar item
    var sidebarItem = document.createElement("div");
    sidebarItem.classList.add("discussion-sidebar-item");
    sidebarItem.classList.add("sidebar-trello");

    // Append the side bar item heading and content.
    sidebarItem.appendChild(contentContainer);
    return contentContainer;
}

function createHeading(headingText) {
    var el = document.createElement("div");
    el.classList.add("discussion-sidebar-heading");
    el.classList.add("text-bold");
    el.innerHTML = headingText;
    return el;
}

var
    stylesId = "hubberdashery-sidebar-item-styles",
    sidebarClass = "hubberdashery-sidebar-item";

function addSidebarContainerStylesIfRequired() {
    if (document.getElementById(stylesId)) {
        return;
    }
    var el = document.createElement("style");
    el.type = "text/css";
    el.id = stylesId;
    el.innerHTML =
    `
    .${sidebarClass} {
        border-width: 1px 0 0 0;
        border-style: solid;
        border-color: #e6ebf1;
        margin-top: 15px;
    }
    `;
    document.body.appendChild(el);
}

function createContainerInDiscussionSidebar() {
    addSidebarContainerStylesIfRequired();
    var parent = document.querySelector(".discussion-sidebar");
    if (!parent) {
        console.error("Can't find [.discussion-sidebar]");
        return;
    }

    var container = document.createElement("div");
    container.classList.add("discussion-sidebar-item");
    container.classList.add("sidebar-trello-items");
    container.classList.add(sidebarClass);
    parent.appendChild(container)
    return container;
}

module.exports = addItemsToSidebar;
},{}],5:[function(require,module,exports){
function ExpandCommentsHack() {
    this.init();
}

var versionLinkClass = "hubberdashery-version-link";

ExpandCommentsHack.prototype = {
    destroy: function() {},
    init: function() {
        if (!this._haveHeaderActions()) {
            window.setTimeout(this.init.bind(this), 1000);
            return;
        }

        this._hasVersionLinks = [];
        this._createButton();
    },
    _createButton: function() {
        var button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-sm");
        button.classList.add("js-detials-target");
        button.innerHTML = "Expand Comments";
        button.addEventListener(
            "click",
            this._continuouslyCheckInAndLoad.bind(this)
        );
        this._expandCommentsButton = button;

        var btnContainer = document.querySelectorAll(".gh-header-actions")[0];
        if (!btnContainer) {
            console.error("Can't find button container (.gh-header-actions)");
            return;
        }
        btnContainer.insertBefore(button, btnContainer.firstChild);
    },
    _loadMore: function() {
        var loadMoreButtons = document.querySelectorAll(".ajax-pagination-btn");

        Array.from(loadMoreButtons).forEach(x =>
            window.setTimeout(x.click.bind(x), 0)
        );

        return loadMoreButtons.length;
    },
    _continuouslyCheckInAndLoad: function() {
        this._updateButtonStatus("⏳ Expanding");
        var loadingCount = this._loadMore();
        var loadedStuff = loadingCount > 0;
        if (loadedStuff) {
            this._updateButtonStatus(
                "⏳ Expanding (" + loadingCount + " left)"
            );
            window.setTimeout(this._continouslyCheckInAndLoad.bind(this), 1000);
        } else {
            this._expandAllComments();
            this._addCommentController();
            this._addVersionLinks();
        }
    },
    _expandAllComments: function() {
        var outdatedButtons = Array.from(
            document.querySelectorAll("summary.js-toggle-outdated-comments")
        ).filter(x => !x.parentElement.open);
        outdatedButtons.forEach(x => window.setTimeout(x.click.bind(x), 0));
    },
    _addCommentController: function() {
        this._updateButtonStatus("✅ Remove Completed Comments");
        this._expandCommentsButton.addEventListener(
            "click",
            this._killAllCommentsRespondedTo.bind(this)
        );
    },
    _addVersionLinks: function() {
        var branchName = this._getBranchName();
        var links = Array.from(document.querySelectorAll("a.file-info"));
        links.forEach(x => {
            var idx = this._hasVersionLinks.indexOf(x);
            if (idx > -1) {
                return;
            }
            this._hasVersionLinks.push(x);
            var viewLatest = this._createVersionLink(x, branchName, "@head");
            x.parentNode.appendChild(viewLatest);
            x.parentNode.appendChild(this._createDivider());
            var changeset = x.href.match("/files/([^.#]+)")[1];
            var viewAtVersion = this._createVersionLink(
                x,
                changeset,
                "@changeset"
            );
            x.parentNode.appendChild(viewAtVersion);
        });
    },
    _getBranchName: function() {
        var commitRefs = document.getElementsByClassName("commit-ref");
        var span = commitRefs[1].getElementsByClassName(
            "css-truncate-target"
        )[0];
        return span.innerHTML.trim();
    },
    _createDivider: function() {
        var span = document.createElement("span");
        span.innerHTML = "&nbsp;";
        return span;
    },
    _updateButtonStatus: function(val) {
        this._expandCommentsButton.innerHTML = val;
    },
    _killAllCommentsRespondedTo: function() {
        var remaining = 0;
        var mainCommentContainers = Array.from(
            document.getElementsByClassName("file js-comment-container")
        );
        mainCommentContainers.forEach(x => {
            remaining++;
            var lastComment = Array.from(
                x.getElementsByClassName("review-comment")
            )
                .slice(-1)
                .pop();
            if (lastComment == null) {
                return;
            }
            var hasThumbsUp =
                Array.from(
                    lastComment.getElementsByClassName("emoji mr-1")
                ).filter(x => x.innerHTML == "👍").length > 0;

            if (hasThumbsUp) {
                x.parentNode.removeChild(x);
                remaining--;
            }
        });
        this._updateButtonStatus("✅ " + remaining + " Comments Remaining");
    },
    _haveHeaderActions: function() {
        return !!document.querySelector(".gh-header-actions");
    },
    _createVersionLink: function(link, branchName, name) {
        var base = link.href.substring(0, link.href.indexOf("/pull"));
        var file = link.title.trim();
        var href = base + "/blob/" + branchName + "/" + file;
        var viewLink = document.createElement("a");
        viewLink.classList.add("Counter");
        viewLink.classList.add(versionLinkClass);
        viewLink.innerHTML = name;
        viewLink.href = href;
        viewLink.target = "_blank";
        return viewLink;
    }
};

ExpandCommentsHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = ExpandCommentsHack;

},{}],6:[function(require,module,exports){
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

    _getClientRectOf: function(el) {
        var result = el.getClientRects()[0];
        if (result) {
            return result;
            this.log("Unable to get client rect for", el);
        }
        return {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        }
    },
    createExtendedMenuLinkedTo: function (button) {
        var buttonRect = this._getClientRectOf(button);
        var menuDiv = this.mkEl("div", {
            attributes: {
                id: "hubberdashery-menu",
                style: {
                    position: "relative",
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
        window.addEventListener("scroll", () => {
            var buttonRect = button.getClientRects()[0];
            console.log("buttonRect", buttonRect);
            // var newTop = buttonRect.top + buttonRect.height;
            // this.log("moving to: ", newTop);
            // menuDiv.style.top = this.px(newTop);
        });
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
},{"./filename-filter":3,"./filename-filter-old":2}],7:[function(require,module,exports){
"use strict";

function PullRequestPagerHack() {
    this.init();
}

PullRequestPagerHack.prototype = {
    destroy: function() {
        if (this.timerHandle) {
            clearInterval(this.timerHandle);
        }
        if (this.container) {
            this.container.parentNode.removeChild(this.container);
        }
    },
    init: function() {
        this._addStyles();

        this._files = document.getElementsByClassName("file");
        this._pageSize = 10;
        this._pageCount = this._files.length / this._pageSize;
        this._selectedPageIndex = 0;
        this._pageContainer = null;
        this._expectedFileCount = parseInt(
            document.getElementById("files_tab_counter").innerText
        );
        this._timerHandle = null;
        this._lastFileCount = 0;

        console.info(`expanding ${this._expectedFileCount} files`);

        window.addEventListener("resize", () => {
            this._centerContainerOnScreen(this._pageContainer);
        });

        var hiddenFragments = document.getElementsByTagName("INCLUDE-FRAGMENT");
        hiddenFragments[hiddenFragments.length - 1].scrollIntoView();
        window.scrollTo(0, 0);

        this._createSelectPager();
        this._timerHandle = window.setInterval(
            this._updatePageOptions.bind(this),
            3000
        );
    },
    _addStyles: function() {
        var el = document.createElement("style");
        el.type = "text/css";
        el.innerHTML = `
            #hb-pager-select {
                border:2px solid grey;
                width:180px;
                height:30px;
                border: 1px solid #d9d9d9;
                cursor: pointer;
                text-align-last: center;
                border-radius: 3px;
                margin-left: 5px;
                margin-right: 5px;
            }
            #hb-pager busy {
                cursor: wait;
            }
            #hb-pager button {
                margin-top: -4px;
            }
            #hb-pager-select option {
                padding:4px;
                border: 1px solid #d9d9d9;
                cursor: pointer;
           }
        `;
        document.body.appendChild(el);
    },
    _getWidth: function() {
        return (
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth ||
            0
        );
    },
    _getHeight: function() {
        return (
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight ||
            0
        );
    },
    _allFilesAreLoaded: function() {
        var allLoaded = this._files.length == this._expectedFileCount;
        if (allLoaded) {
            return true;
        }

        // if not matching, then we have to investigate a bit deeper
        if (this._files.length > 0) {
            var lastFile = this._files[this._files.length - 1];
            return lastFile.nextElementSibling == null;
        }

        return false;
    },
    _showPage: function(pageIndex) {
        this._selectedPageIndex = pageIndex;

        var startFileIndex = pageIndex * this._pageSize;
        var endFileIndex = startFileIndex + this._pageSize;
        for (var fileIndex = 0; fileIndex < this._files.length; fileIndex++) {
            var show = fileIndex >= startFileIndex && fileIndex < endFileIndex;
            var file = this._files[fileIndex];
            file.style.display = show ? "block" : "none";
            if (!show) {
                continue;
            }

            if (file._hasContentLoaded) {
                continue;
            }

            // check if the contents need to be expanded
            file._hasContentLoaded = true;
            var includeFragments = Array.from(
                file.getElementsByTagName("INCLUDE-FRAGMENT")
            );
            includeFragments.forEach(x => {
                var buttons = x.getElementsByTagName("BUTTON");
                var loadMoreBtn = buttons.length > 0 ? buttons[0] : null;
                if (loadMoreBtn) {
                    window.setTimeout(loadMoreBtn.click.bind(loadMoreBtn), 0);
                }
            });
        }
    },
    _centerContainerOnScreen: function() {
        var container = this._pageContainer;
        container.style.left =
            this._getWidth() / 2 - container.offsetWidth / 2 + "px";
        container.style.top =
            this._getHeight() - container.offsetHeight - 20 + "px";
    },
    _onPageChangeHandler: function(e) {
        var page = e.target.value;
        this._showAndScrollToPage(page);
    },
    _showAndScrollToPage: function(page) {
        if (this._page < 0 || this._page >= this._pageCount) {
            return;
        }
        this._showPage(parseInt(page));
        window.scrollTo(0, 0);
    },
    _createPreviousButton: function() {
        var button = document.createElement("button");
        button.id = "hb-pager-prev";
        button.disabled = "disabled";
        this._addButtonClassesTo(button);
        button.innerHTML = "&#8592;";
        button.addEventListener("click", () => this._changeSelectedPage(-1));
        this._prevButton = button;
        return button;
    },
    _createNextButton: function() {
        var button = document.createElement("button");
        button.id = "hb-pager-next";
        button.disabled = "disabled";
        this._addButtonClassesTo(button);
        button.innerHTML = "&#8594;";
        button.addEventListener("click", () => this._changeSelectedPage(1));
        this._nextButton = button;
        return button;
    },
    _createPageSelect: function() {
        var el = document.createElement("select");
        el.id = "hb-pager-select";
        el.disabled = true;
        el.classList.add("btn-outline");
        el.classList.add("busy");
        el.addEventListener("change", this._onPageChangeHandler.bind(this));
        this._pageSelect = el;
        return el;
    },
    _recalculatePageOptionLabels: function() {
        if (!this._pageSelect) {
            return;
        }
        Array.from(this._pageSelect.querySelectorAll("option")).forEach(opt => {
            var pageStart = parseInt(opt.getAttribute("data-page-start"));
            var pageEnd = parseInt(opt.getAttribute("data-page-end"));
            if (opt.selected) {
                var fileCount = opt.getAttribute("data-file-count");
                opt.innerText = `Files: ${pageStart +
                    1} - ${pageEnd} of ${fileCount}`;
            } else {
                opt.innerText = `Files: ${pageStart + 1} - ${pageEnd}`;
            }
        });
    },
    _addButtonClassesTo: function(button) {
        ["btn", "btn-sm", "btn-outline", "busy"].forEach(c =>
            button.classList.add(c)
        );
    },
    _createSelectPager: function() {
        // create the static container
        var pageContainer = (this._pageContainer = document.createElement(
            "div"
        ));
        pageContainer.id = "hb-pager";
        pageContainer.style.position = "fixed";
        pageContainer.style.top = "0px";
        pageContainer.style.left = "-1000px";
        pageContainer.style.margin = "0px";
        pageContainer.style.zIndex = "99999";
        pageContainer.style.backgroundColor = "transparent";
        document.getElementsByTagName("body")[0].appendChild(pageContainer);

        console.info("building up hubber dashery pager links");
        [
            this._createPreviousButton(),
            this._createPageSelect(),
            this._createNextButton()
        ].forEach(el => pageContainer.appendChild(el));

        this._updatePageOptions();
        this._centerContainerOnScreen(pageContainer);
    },
    _changeSelectedPage: function(delta) {
        var newPage = this._selectedPageIndex + delta;
        if (newPage < 0 || newPage >= this._pageCount) {
            return;
        }
        document.getElementById("hb-pager-select").selectedIndex = newPage;
        this._showAndScrollToPage(newPage);
        this._recalculatePageOptionLabels();
    },
    _updatePageOptions: function() {
        this._files = document.getElementsByClassName("file");
        var fileCount = this._files.length;
        var selectList = document.getElementById("hb-pager-select");

        if (this._lastFileCount === fileCount) {
            console.log("aborting: _lastFileCount === fileCount", fileCount);
            // no need to update
            return;
        }

        Array.from(selectList.childNodes).forEach(e => e.remove());
        this._pageCount = Math.ceil(fileCount / this._pageSize);

        // add options
        var options = [];
        var pageStart = 0;
        for (var i = 0; i < this._pageCount; i++) {
            var pageEnd = pageStart + this._pageSize;
            if (pageEnd > fileCount) {
                pageEnd = fileCount;
            }
            var option = document.createElement("option");
            var attribs = {
                "data-page": i,
                value: i,
                "data-page-start": pageStart,
                "data-page-end": pageEnd,
                "data-file-count": fileCount
            };
            Object.keys(attribs).forEach(k =>
                option.setAttribute(k, attribs[k])
            );
            option.innerText =
                i == 0
                    ? `Files: ${pageStart + 1} - ${pageEnd} of ${fileCount}`
                    : `Files: ${pageStart + 1} - ${pageEnd}`;
            options.push(option);
            pageStart += this._pageSize;
        }

        options.forEach(opt => {
            selectList.appendChild(opt);
        });
        this._lastFileCount = fileCount;

        if (this._allFilesAreLoaded(files)) {
            if (this._timerHandle) {
                window.clearInterval(this._timerHandle);
            }

            // enable controls
            var ids = ["hb-pager-prev", "hb-pager-select", "hb-pager-next"];
            ids.forEach(x => {
                var el = document.getElementById(x);
                el.disabled = false;
                el.classList.remove("busy");
            });
            this._showPage(0);
        }
    }
};

PullRequestPagerHack.urlMatch = /.*\/pull\/.*\/files.*/;
module.exports = PullRequestPagerHack;

},{}],8:[function(require,module,exports){
"use strict";
var addToSidebarFunc = require('./modules/add-to-sidebar');

function TrelloSidebarHack() {
    this.init();
}

TrelloSidebarHack.prototype = {
    destroy: function(){
    },
    init: function(){
        var comments = Array.from(document.getElementsByClassName('d-block comment-body markdown-body  js-comment-body'));
        var trelloComments = comments.filter(x => x.innerHTML.indexOf("trello") !== -1);

        if(trelloComments.length !== 1) {
            console.log(`${comments.length} comments detected. ${trelloComments.length} trello items detected.`);
            return;
        }

        var trelloItem = trelloComments[0];
        addToSidebarFunc('Trello', trelloItem.innerHTML);
    }
};

TrelloSidebarHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = TrelloSidebarHack;
},{"./modules/add-to-sidebar":4}]},{},[1])
})();