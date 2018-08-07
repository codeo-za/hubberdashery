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
