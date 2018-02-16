var 
    PullRequestsHack = require("./pull-requests-hack");

var hacks = [ PullRequestsHack ];
var available = hacks.filter(h => window.location.pathname.match(h.urlMatch));
available.forEach(a => new (a));
