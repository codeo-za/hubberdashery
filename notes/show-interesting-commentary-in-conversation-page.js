// hides all commentary with three or less word last-replies
// (eg "Fixed", "renamed", etc)
// expands all commentary with more information in it
// TODO: some kind of visual feedback that something happened


var el = document.getElementsByClassName('outdated-comment');
for (var e of el) { 
    var comments = e.getElementsByClassName('js-comment-body');
    if (comments && comments.length > 0){
        var lastComment = comments[comments.length - 1];
        var body = lastComment.textContent.trim();
        var wordCount = body.split(' ').length;
        if (wordCount <= 2){
            // high probability this is "ok", "done", "updated" etc
            continue;
        }
    }
    e.className += ' open Details--on';
}

var buttons = document.getElementsByTagName("button");
var searchText = new RegExp("load more.*", "gi");

for(var button of buttons){
    if (button.textContent.match(searchText)){
        console.log(`found a match with ${button.textContent.trim()}`);
        window.setTimeout(button.click.bind(button),0);
    }
}
