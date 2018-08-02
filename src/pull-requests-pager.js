"use strict";

function PullRequestPagerHack() {
    this.init();
}

PullRequestPagerHack.prototype = {
    destroy: function() {
        if (this.timerHandle) {
            clearInterval(this.timerHandle);
        }
        if (this.container) {
            this.container.parentNode.removeChild(this.container);
        }
    },
    init: function() {
        this._addStyles();

        this._files = document.getElementsByClassName("file");
        this._pageSize = 10;
        this._pageCount = this._files.length / this._pageSize;
        this._selectedPageIndex = 0;
        this._pageContainer = null;
        this._expectedFileCount = parseInt(
            document.getElementById("files_tab_counter").innerText
        );
        this._timerHandle = null;
        this._lastFileCount = 0;

        console.info(`expanding ${this._expectedFileCount} files`);

        window.addEventListener("resize", () => {
            this._centerContainerOnScreen(this._pageContainer);
        });

        var hiddenFragments = document.getElementsByTagName("INCLUDE-FRAGMENT");
        hiddenFragments[hiddenFragments.length - 1].scrollIntoView();
        window.scrollTo(0, 0);

        this._createSelectPager();
        this._timerHandle = window.setInterval(
            this._updatePageOptions.bind(this),
            3000
        );
    },
    _addStyles: function() {
        var el = document.createElement("style");
        el.type = "text/css";
        el.innerHTML = `
            #hb-pager-select {
                border:2px solid grey;
                width:180px;
                height:30px;
                border: 1px solid #d9d9d9;
                cursor: pointer;
                text-align-last: center;
                border-radius: 3px;
                margin-left: 5px;
                margin-right: 5px;
            }
            #hb-pager busy {
                cursor: wait;
            }
            #hb-pager button {
                margin-top: -4px;
            }
            #hb-pager-select option {
                padding:4px;
                border: 1px solid #d9d9d9;
                cursor: pointer;
           }
        `;
        document.body.appendChild(el);
    },
    _getWidth: function() {
        return (
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth ||
            0
        );
    },
    _getHeight: function() {
        return (
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight ||
            0
        );
    },
    _allFilesAreLoaded: function() {
        var allLoaded = this._files.length == this._expectedFileCount;
        if (allLoaded) {
            return true;
        }

        // if not matching, then we have to investigate a bit deeper
        if (this._files.length > 0) {
            var lastFile = this._files[this._files.length - 1];
            return lastFile.nextElementSibling == null;
        }

        return false;
    },
    _showPage: function(pageIndex) {
        this._selectedPageIndex = pageIndex;

        var startFileIndex = pageIndex * this._pageSize;
        var endFileIndex = startFileIndex + this._pageSize;
        for (var fileIndex = 0; fileIndex < this._files.length; fileIndex++) {
            var show = fileIndex >= startFileIndex && fileIndex < endFileIndex;
            var file = this._files[fileIndex];
            file.style.display = show ? "block" : "none";
            if (!show) {
                continue;
            }
            if (!file._hasContentLoaded) {
                continue;
            }

            // check if the contents need to be expanded
            file._hasContentLoaded = true;
            var includeFragments = Array.from(
                file.getElementsByTagName("INCLUDE-FRAGMENT")
            );
            includeFragments.forEach(x => {
                var buttons = x.getElementsByTagName("BUTTON");
                var loadMoreBtn = buttons.length > 0 ? buttons[0] : null;
                if (loadMoreBtn) {
                    window.setTimeout(loadMoreBtn.click.bind(loadMoreBtn), 0);
                }
            });
        }
    },
    _centerContainerOnScreen: function() {
        var container = this._pageContainer;
        container.style.left =
            this._getWidth() / 2 - container.offsetWidth / 2 + "px";
        container.style.top =
            this._getHeight() - container.offsetHeight - 20 + "px";
    },
    _onPageChangeHandler: function(e) {
        var page = e.target.value;
        this._showAndScrollToPage(page);
    },
    _showAndScrollToPage: function(page) {
        if (this._page < 0 || this._page >= this._pageCount) {
            return;
        }
        this._showPage(parseInt(page));
        window.scrollTo(0, 0);
    },
    _createPreviousButton: function() {
        var button = document.createElement("button");
        button.id = "hb-pager-prev";
        button.disabled = "disabled";
        this._addButtonClassesTo(button);
        button.innerHTML = "&#8592;";
        button.addEventListener("click", () => this._changeSelectedPage(-1));
        this._prevButton = button;
        return button;
    },
    _createNextButton: function() {
        var button = document.createElement("button");
        button.id = "hb-pager-next";
        button.disabled = "disabled";
        this._addButtonClassesTo(button);
        button.innerHTML = "&#8594;";
        button.addEventListener("click", () => this._changeSelectedPage(1));
        this._nextButton = button;
        return button;
    },
    _createPageSelect: function() {
        var el = document.createElement("select");
        el.id = "hb-pager-select";
        el.disabled = true;
        el.classList.add("btn-outline");
        el.classList.add("busy");
        el.addEventListener("change", this._onPageChangeHandler.bind(this));
        this._pageSelect = el;
        return el;
    },
    _recalculatePageOptionLabels: function() {
        if (!this._pageSelect) {
            return;
        }
        Array.from(this._pageSelect.querySelectorAll("option")).forEach(opt => {
            var pageStart = parseInt(opt.getAttribute("data-page-start"));
            var pageEnd = parseInt(opt.getAttribute("data-page-end"));
            if (opt.selected) {
                var fileCount = opt.getAttribute("data-file-count");
                opt.innerText = `Files: ${pageStart +
                    1} - ${pageEnd} of ${fileCount}`;
            } else {
                opt.innerText = `Files: ${pageStart + 1} - ${pageEnd}`;
            }
        });
    },
    _addButtonClassesTo: function(button) {
        ["btn", "btn-sm", "btn-outline", "busy"].forEach(c =>
            button.classList.add(c)
        );
    },
    _createSelectPager: function() {
        // create the static container
        var pageContainer = (this._pageContainer = document.createElement(
            "div"
        ));
        pageContainer.id = "hb-pager";
        pageContainer.style.position = "fixed";
        pageContainer.style.top = "0px";
        pageContainer.style.left = "-1000px";
        pageContainer.style.margin = "0px";
        pageContainer.style.zIndex = "99999";
        pageContainer.style.backgroundColor = "transparent";
        document.getElementsByTagName("body")[0].appendChild(pageContainer);

        console.info("building up hubber dashery pager links");
        [
            this._createPreviousButton(),
            this._createPageSelect(),
            this._createNextButton()
        ].forEach(el => pageContainer.appendChild(el));

        this._updatePageOptions();
        this._centerContainerOnScreen(pageContainer);
    },
    _changeSelectedPage: function(delta) {
        var newPage = this._selectedPageIndex + delta;
        if (newPage < 0 || newPage >= this._pageCount) {
            return;
        }
        document.getElementById("hb-pager-select").selectedIndex = newPage;
        this._showAndScrollToPage(newPage);
        this._recalculatePageOptionLabels();
    },
    _updatePageOptions: function() {
        this._files = document.getElementsByClassName("file");
        var fileCount = this._files.length;
        var selectList = document.getElementById("hb-pager-select");

        if (this._lastFileCount === fileCount) {
            console.log("aborting: _lastFileCount === fileCount", fileCount);
            // no need to update
            return;
        }

        Array.from(selectList.childNodes).forEach(e => e.remove());
        this._pageCount = Math.ceil(fileCount / this._pageSize);

        // add options
        var options = [];
        var pageStart = 0;
        for (var i = 0; i < this._pageCount; i++) {
            var pageEnd = pageStart + this._pageSize;
            if (pageEnd > fileCount) {
                pageEnd = fileCount;
            }
            var option = document.createElement("option");
            var attribs = {
                "data-page": i,
                value: i,
                "data-page-start": pageStart,
                "data-page-end": pageEnd,
                "data-file-count": fileCount
            };
            Object.keys(attribs).forEach(k =>
                option.setAttribute(k, attribs[k])
            );
            option.innerText =
                i == 0
                    ? `Files: ${pageStart + 1} - ${pageEnd} of ${fileCount}`
                    : `Files: ${pageStart + 1} - ${pageEnd}`;
            options.push(option);
            pageStart += this._pageSize;
        }

        options.forEach(opt => {
            selectList.appendChild(opt);
        });
        this._lastFileCount = fileCount;

        if (this._allFilesAreLoaded(files)) {
            if (this._timerHandle) {
                window.clearInterval(this._timerHandle);
            }

            // enable controls
            var ids = ["hb-pager-prev", "hb-pager-select", "hb-pager-next"];
            ids.forEach(x => {
                var el = document.getElementById(x);
                el.disabled = false;
                el.classList.remove("busy");
            });
            this._showPage(0);
        }
    }
};

PullRequestPagerHack.urlMatch = /.*\/pull\/.*\/files.*/;
module.exports = PullRequestPagerHack;
