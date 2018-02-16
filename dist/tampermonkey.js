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
    PullRequestsHack = require("./pull-requests-hack");

var hacks = [ PullRequestsHack ];
var available = hacks.filter(h => window.location.pathname.match(h.urlMatch));
available.forEach(a => new (a));

},{"./pull-requests-hack":4}],2:[function(require,module,exports){
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
function FilenameFilter(filterText) {
    this._filterText = filterText;
}
FilenameFilter.prototype = {
    filter: function (fileElements) {
        var filters = value.split(",")
            .map(Part => this.makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var display = filters.length === 0 || filters.reduce((acc2, cur2) => {
                return acc2 || this.matches(file.fileName, cur2);
            }, false);
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
    }
};

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
    }
};


module.exports = FilenameFilter;
},{}],4:[function(require,module,exports){
var 
    FilenameFilter = require("./filename-filter-old")
    FilenameFilterLite = require("./filename-filter");

function PullRequestsHack() {
    this._waited = 0;
    this.init();
}
PullRequestsHack.urlMatch = /.*\/pull\/.*/;
PullRequestsHack.prototype = {
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
},{"./filename-filter":3,"./filename-filter-old":2}]},{},[1])
})();