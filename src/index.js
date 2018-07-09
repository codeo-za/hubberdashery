var 
    PullRequestsHack = require("./pull-requests-hack"),
    PullRequestPagerHack = require('./pull-requests-pager'),
    PullRequestCommentHack = require('./pull-request-show-all-comments');

var hacks = [
    PullRequestsHack, 
    PullRequestPagerHack,
    PullRequestCommentHack];
var available = hacks.filter(h => window.location.pathname.match(h.urlMatch));
available.forEach(a => new (a));
