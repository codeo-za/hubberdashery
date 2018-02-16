function FilenameFilter(filterText) {
    this._filterText = filterText;
}
FilenameFilter.prototype = {
    filter: function (fileElements) {
        var filters = value.split(",")
            .map(Part => this.makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var display = filters.length === 0 || filters.reduce((acc2, cur2) => {
                return acc2 || this.matches(file.fileName, cur2);
            }, false);
        });
    },
    matches: function (str, filter) {
        var isMatch = str.match(filter.re);
        return filter.match ? isMatch : !isMatch;
    },
    makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }
            if (trimmed[0] === "/" && trimmed.split("/").length > 2) {
                // raw regex
                return { re: new RegExp(trimmed), match: true };
            }
            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this.looksLikeFileExtensionFilter(trimmed)
                ? new RegExp("." + trimmed + "$")
                : new RegExp(trimmed);
            return {
                re: re,
                match: match
            };
        } catch (e) { /* ignore: filter is probably incomplete */ }
    },

    looksLikeFileExtensionFilter: function (filter) {
        var parts = filter.split(".");
        return filter === "*" || parts.length === 2 &&
            parts[0] === "*";
    }
};

function FilenameFilter(filterText) {
    this._filterText = filterText;
}
FilenameFilter.prototype = {
    filter: function () {
        var value = this._filterText.trim();
        var filters = value.split(",")
            .map(part => this.makeFilterFor(part))
            .filter(re => re);

        var files = Array.from(document.querySelectorAll("div.file"));
        var visibleCount = files.length;
        var counterEl = document.querySelector("#files_tab_counter");
        counterEl.innerText = visibleCount;
        counterEl.style.border = "";
        return files.reduce((acc, cur) => {
            return acc.then(() => {
                var fileName = Array.from(cur.querySelectorAll("a"))
                    .filter(a => a.href.indexOf("#diff") >= 0)
                    .map(a => a.innerText)[0];

                var display = filters.length === 0 || filters.reduce((acc2, cur2) => {
                    return acc2 || this.matches(fileName, cur2);
                }, false);

                cur.style.display = display ? "" : "none";
                if (!display) {
                    visibleCount--;
                    counterEl.innerText = visibleCount;
                }
                counterEl.style.border = "1px solid red";
            });
        }, new Promise((resolve, reject) => resolve()));
    },
    matches: function (str, filter) {
        var isMatch = str.match(filter.re);
        return filter.match ? isMatch : !isMatch;
    },
    makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }
            if (trimmed[0] === "/" && trimmed.split("/").length > 2) {
                // raw regex
                return { re: new RegExp(trimmed), match: true };
            }
            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this.looksLikeFileExtensionFilter(trimmed)
                ? new RegExp("." + trimmed + "$")
                : new RegExp(trimmed);
            return {
                re: re,
                match: match
            };
        } catch (e) { /* ignore: filter is probably incomplete */ }
    },

    looksLikeFileExtensionFilter: function (filter) {
        var parts = filter.split(".");
        return filter === "*" || parts.length === 2 &&
            parts[0] === "*";
    }
};


module.exports = FilenameFilter;