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
            console.log(`WARNING: ${comments.length} comments detected. ${trelloComments.length} trello items detected.`);
            return;
        }

        var trelloItem = trelloComments[0];
        addToSidebarFunc('Trello', trelloItem.innerHTML);
    }
};

TrelloSidebarHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = TrelloSidebarHack;