"use strict";
var
    PullRequestsHack = require("./pull-requests-hack"),
    PullRequestPagerHack = require('./pull-requests-pager'),
    PullRequestCommentHack = require('./pull-request-show-all-comments'),
    TrelloSidebarHack = require('./trello-sidebar-hack'),
    NotificationsViewHack = require("./notifications-view-hack");

var hacks = [
    PullRequestsHack,
    PullRequestPagerHack,
    PullRequestCommentHack,
    TrelloSidebarHack,
    NotificationsViewHack];

var runningHacks = [];

var executeHacks = function(){
    var path = window.location.pathname;
    console.info('Hubberdashery - executing matchers for ' + path);
    runningHacks.forEach(x => x.destroy());
    var available = hacks.filter(h => path.match(h.urlMatch));
    console.log("have available hacks: ", available);
    runningHacks = available.map(a => new (a));
}

var currentPath = "";
window.setInterval(function(){
        if (currentPath == window.location.pathname){
            return;
        }
        console.info('Hubberdashery - detected url change');
        window.setTimeout(executeHacks, 0);
        currentPath = window.location.pathname;
    }, 1000);