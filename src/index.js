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