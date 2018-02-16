function FilenameFilterLite(filterText) {
    this._filterText = filterText || "";
}
FilenameFilterLite.prototype = {
    filter: function (fileElements) {
        var filters = this._filterText.trim().split(",")
            .map(part => this.makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var positiveFilters = filters.filter(f => f.match);
            var negativeFilters = filters.filter(f => !f.match);
            const includedByPositiveFilters = positiveFilters.length === 0 ||
                positiveFilters.reduce((acc2, filter) => {
                    return acc2 || file.match(filter.re)
                }, false);
            const negativeFilterMatch = negativeFilters.length === 0 
            ? false
            : negativeFilters.reduce((acc2, filter) => {
                return acc2 || !!file.match(filter.re)
            }, false);
            return includedByPositiveFilters && !negativeFilterMatch;
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
            // if (trimmed[0] === "/" && trimmed.split("/").length > 2) {
            //     // raw regex
            //     return { re: new RegExp(trimmed), match: true };
            // }
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
        } catch (e) { 
            console.log(`ignoring filter '${text}'`, e.toString());
            /* ignore: filter is probably incomplete */ 
        }
    },

    looksLikeFileExtensionFilter: function (filter) {
        var parts = filter.split(".");
        return filter === "*" || parts.length === 2 &&
            parts[0] === "*";
    }
};


module.exports = FilenameFilterLite;