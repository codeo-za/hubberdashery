function ExpandCommentsHack() {
    this.init();
}

var versionLinkClass = "hubberdashery-version-link";

ExpandCommentsHack.prototype = {
    destroy: function() {},
    init: function() {
        if (!this._haveHeaderActions()) {
            window.setTimeout(this.init.bind(this), 1000);
            return;
        }

        this._hasVersionLinks = [];
        this._createButton();
    },
    _createButton: function() {
        var button = document.createElement("button");
        button.classList.add("btn");
        button.classList.add("btn-sm");
        button.classList.add("js-detials-target");
        button.innerHTML = "Expand Comments";
        button.addEventListener(
            "click",
            this._continuouslyCheckInAndLoad.bind(this)
        );
        this._expandCommentsButton = button;

        var btnContainer = document.querySelectorAll(".gh-header-actions")[0];
        if (!btnContainer) {
            console.error("Can't find button container (.gh-header-actions)");
            return;
        }
        btnContainer.insertBefore(button, btnContainer.firstChild);
    },
    _loadMore: function() {
        var loadMoreButtons = document.querySelectorAll(".ajax-pagination-btn");

        Array.from(loadMoreButtons).forEach(x =>
            window.setTimeout(x.click.bind(x), 0)
        );

        return loadMoreButtons.length;
    },
    _continuouslyCheckInAndLoad: function() {
        this._updateButtonStatus("⏳ Expanding");
        var loadingCount = this._loadMore();
        var loadedStuff = loadingCount > 0;
        if (loadedStuff) {
            this._updateButtonStatus(
                "⏳ Expanding (" + loadingCount + " left)"
            );
            window.setTimeout(this._continouslyCheckInAndLoad.bind(this), 1000);
        } else {
            this._expandAllComments();
            this._addCommentController();
            this._addVersionLinks();
        }
    },
    _expandAllComments: function() {
        var outdatedButtons = Array.from(
            document.querySelectorAll("summary.js-toggle-outdated-comments")
        ).filter(x => !x.parentElement.open);
        outdatedButtons.forEach(x => window.setTimeout(x.click.bind(x), 0));
    },
    _addCommentController: function() {
        this._updateButtonStatus("✅ Remove Completed Comments");
        this._expandCommentsButton.addEventListener(
            "click",
            this._killAllCommentsRespondedTo.bind(this)
        );
    },
    _addVersionLinks: function() {
        var branchName = this._getBranchName();
        var links = Array.from(document.querySelectorAll("a.file-info"));
        links.forEach(x => {
            var idx = this._hasVersionLinks.indexOf(x);
            if (idx > -1) {
                return;
            }
            this._hasVersionLinks.push(x);
            var viewLatest = this._createVersionLink(x, branchName, "@head");
            x.parentNode.appendChild(viewLatest);
            x.parentNode.appendChild(this._createDivider());
            var changeset = x.href.match("/files/([^.#]+)")[1];
            var viewAtVersion = this._createVersionLink(
                x,
                changeset,
                "@changeset"
            );
            x.parentNode.appendChild(viewAtVersion);
        });
    },
    _getBranchName: function() {
        var commitRefs = document.getElementsByClassName("commit-ref");
        var span = commitRefs[1].getElementsByClassName(
            "css-truncate-target"
        )[0];
        return span.innerHTML.trim();
    },
    _createDivider: function() {
        var span = document.createElement("span");
        span.innerHTML = "&nbsp;";
        return span;
    },
    _updateButtonStatus: function(val) {
        this._expandCommentsButton.innerHTML = val;
    },
    _killAllCommentsRespondedTo: function() {
        var remaining = 0;
        var mainCommentContainers = Array.from(
            document.getElementsByClassName("file js-comment-container")
        );
        mainCommentContainers.forEach(x => {
            remaining++;
            var lastComment = Array.from(
                x.getElementsByClassName("review-comment")
            )
                .slice(-1)
                .pop();
            if (lastComment == null) {
                return;
            }
            var hasThumbsUp =
                Array.from(
                    lastComment.getElementsByClassName("emoji mr-1")
                ).filter(x => x.innerHTML == "👍").length > 0;

            if (hasThumbsUp) {
                x.parentNode.removeChild(x);
                remaining--;
            }
        });
        this._updateButtonStatus("✅ " + remaining + " Comments Remaining");
    },
    _haveHeaderActions: function() {
        return !!document.querySelector(".gh-header-actions");
    },
    _createVersionLink: function(link, branchName, name) {
        var base = link.href.substring(0, link.href.indexOf("/pull"));
        var file = link.title.trim();
        var href = base + "/blob/" + branchName + "/" + file;
        var viewLink = document.createElement("a");
        viewLink.classList.add("Counter");
        viewLink.classList.add(versionLinkClass);
        viewLink.innerHTML = name;
        viewLink.href = href;
        viewLink.target = "_blank";
        return viewLink;
    }
};

ExpandCommentsHack.urlMatch = /.*\/pull\/[\d]+\/?$/;
module.exports = ExpandCommentsHack;
