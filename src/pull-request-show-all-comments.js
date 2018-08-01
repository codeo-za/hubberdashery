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

        function loadMore() {
            var loadMoreButtons = document.getElementsByClassName('ajax-pagination-btn');

            Array
                .from(loadMoreButtons)
                .forEach(x => window.setTimeout(x.click.bind(x), 0));


            return loadMoreButtons.length;
        };

        function expandAllComments() {
            var outdatedButtons =
                Array
                    .from(document.querySelectorAll('summary.js-toggle-outdated-comments'))
                    .filter(x => !x.parentElement.open);
            outdatedButtons.forEach(x => window.setTimeout(x.click.bind(x), 0));
        };

        function updateButtonStatus(val){
            btnExpandComments.innerHTML = val;
        };

        function continouslyCheckInAndLoad() {
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

        function addCommentController(){
            updateButtonStatus('✅ Remove Completed Comments');
            btnExpandComments.onclick = killAllCommentsRespondedTo;
        };

        function killAllCommentsRespondedTo(){
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

        var versionLinkClass = "hubberdashery-version-link";

        /*
        * Version Links
        */
       function createVersionLink(
            link,
            branchName,
            name){

            var base = link.href.substring(0, link.href.indexOf('/pull'));
            var file = link.title.trim();
            var href = base + '/blob/' + branchName + '/' + file;
            var viewLink = document.createElement("a");
            viewLink.classList.add("Counter");
            viewLink.classList.add(versionLinkClass);
            viewLink.innerHTML = name;
            viewLink.href = href;
            viewLink.target = "_blank";
            return viewLink;
        };

        function getBranchName(){
            var commitRefs = document.getElementsByClassName('commit-ref');
            var span = commitRefs[1].getElementsByClassName('css-truncate-target')[0];
            return span.innerHTML.trim();
        };

        function createDivider(){
            var span = document.createElement("span");
            span.innerHTML = "&nbsp;";
            return span;
        };

        var hasVersionLinks = [];

        function addVersionLinks(){
            var branchName = getBranchName();
            var links = Array.from(document.querySelectorAll('a.file-info'));
            links.forEach(x => {
                var idx = hasVersionLinks.indexOf(x);
                if (idx > -1) {
                    return;
                }
                hasVersionLinks.push(x);
                var viewLatest = createVersionLink(x, branchName, "@head");
                x.parentNode.appendChild(viewLatest);
                x.parentNode.appendChild(createDivider());
                var changeset = x.href.match('/files/([^\.#]+)')[1];
                var viewAtVersion = createVersionLink(x, changeset, "@changeset");
                x.parentNode.appendChild(viewAtVersion);
            });
        };
    }
};

ExpandCommentsHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = ExpandCommentsHack;