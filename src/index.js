var 
    PullRequestsHack = require("./pull-requests-hack"),
    PullRequestPagerHack = require('./pull-requests-pager');

var hacks = [ PullRequestsHack, PullRequestPagerHack];
var available = hacks.filter(h => window.location.pathname.match(h.urlMatch));
available.forEach(a => new (a));
