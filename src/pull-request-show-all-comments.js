function ExpandCommentsHack() {
    this.init();
};

ExpandCommentsHack.prototype = {
    destroy: function(){
    },
    init: function(){

        var headerActionsEl = document.getElementsByClassName('gh-header-actions');
        if (headerActionsEl.length == 0) {
            // element not available, poll
            window.setTimeout(this.init.bind(this), 1000);
            return;
        }

        var btnExpandComments = document.createElement("button");
        btnExpandComments.classList.add("btn");
        btnExpandComments.classList.add("btn-sm");
        btnExpandComments.classList.add("js-detials-target");
        btnExpandComments.innerHTML = "Expand Comments";
        
        var btnContainer = headerActionsEl[0];
        btnContainer.insertBefore(
            btnExpandComments, 
            btnContainer.firstChild);

        var loadMore = function () {
            var loadMoreButtons = document.getElementsByClassName('ajax-pagination-btn');

            Array
                .from(loadMoreButtons)
                .forEach(x => window.setTimeout(x.click.bind(x), 0));


            return loadMoreButtons.length;
        };

        var expandAllComments = function () {
            var outdatedButtons =
                Array
                    .from(document.getElementsByTagName('BUTTON'))
                    .filter(x =>
                        x.className.indexOf('show-outdated-button') > -1
                        && x.offsetParent != null // visible
                    );
            outdatedButtons.forEach(x => window.setTimeout(x.click.bind(x), 0));
        };

        var updateButtonStatus = function(val){
            btnExpandComments.innerHTML = val;
        };

        var continouslyCheckInAndLoad = function () {
            updateButtonStatus('⏳ Expanding');
            var loadingCount = loadMore();
            var loadedStuff = loadingCount > 0;
            if (loadedStuff) {
                updateButtonStatus('⏳ Expanding (' + loadingCount + ' left)');
                window.setTimeout(continouslyCheckInAndLoad, 1000);
            } else {
                expandAllComments();
                addCommentController();
                addVersionLinks();
            }
        };

        var addCommentController = function(){
            updateButtonStatus('✅ Remove Completed Comments');
            btnExpandComments.onclick = killAllCommentsRespondedTo; 
        };

        var killAllCommentsRespondedTo = function(){
            var remaining = 0;
            var mainCommentContainers = Array.from(document.getElementsByClassName('file js-comment-container'));
            mainCommentContainers.forEach(x => {
                remaining++;
                var lastComment = Array.from(x.getElementsByClassName('review-comment')).slice(-1).pop();
                if (lastComment == null){
                    return;
                }
                var hasThumbsUp = 
                    Array.from(lastComment.getElementsByClassName('emoji mr-1'))
                    .filter(x => x.innerHTML == '👍')
                    .length > 0;

                if (hasThumbsUp){
                    x.parentNode.removeChild(x);
                    remaining--;
                }
            });
            updateButtonStatus('✅ ' + remaining + ' Comments Remaining');
        };

        btnExpandComments.onclick = continouslyCheckInAndLoad;


        /*
        * Version Links
        */
       var createVersionLink = function(
            link, 
            branchName,
            name){
        
            var base = link.href.substring(0, link.href.indexOf('/pull'));
            var file = link.innerHTML.trim();
            var href = base + '/blob/' + branchName + '/' + file;
            var viewLink = document.createElement("a");
            viewLink.classList.add("file-info");
            viewLink.classList.add("link-gray-dark");
            viewLink.style = "background-color: #e9e9e9;padding:5px;";
            viewLink.innerHTML = name;
            viewLink.href = href;
            viewLink.target = "_blank";
            return viewLink;
        };
        
        var getBranchName = function(){
            var commitRefs = document.getElementsByClassName('commit-ref');
            var span = commitRefs[1].getElementsByClassName('css-truncate-target')[0];
            return span.innerHTML.trim();
        };
        
        var createDivider = function(){
            var span = document.createElement("span");
            span.innerHTML = "&nbsp;";
            return span;
        };
        
        var addVersionLinks = function(){
            var branchName = getBranchName();
            var links = Array.from(document.querySelectorAll('a.file-info'));
            links.forEach(x => {
                var viewLatest = createVersionLink(x, branchName, "Latest");
                x.parentNode.appendChild(viewLatest);
                x.parentNode.appendChild(createDivider());
                var changeset = x.href.match('/files/([^#]+)#')[1];
                var viewAtVersion = createVersionLink(x, changeset, "@Changeset");
                x.parentNode.appendChild(viewAtVersion);
            });
        };
    }
};

ExpandCommentsHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = ExpandCommentsHack;