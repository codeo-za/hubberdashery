const simpleFilterChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890.*";
function FilenameFilterLite(filterText) {
    this._filterText = filterText || "";
}
FilenameFilterLite.prototype = {
    filter: function (fileElements) {
        var filters = this._filterText.trim().split(",")
            .map(part => this._makeFilterFor(part))
            .filter(f => f);
        return fileElements.filter(file => {
            var positiveFilters = filters.filter(f => f.match);
            var negativeFilters = filters.filter(f => !f.match);
            const includedByPositiveFilters = positiveFilters.length === 0 ||
                positiveFilters.reduce((acc2, filter) => {
                    return acc2 || file.fileName.match(filter.re)
                }, false);
            const negativeFilterMatch = negativeFilters.length === 0
                ? false
                : negativeFilters.reduce((acc2, filter) => {
                    return acc2 || !!file.fileName.match(filter.re)
                }, false);
            return includedByPositiveFilters && !negativeFilterMatch;
        });
    },
    _makeFilterFor: function (text) {
        try {
            var trimmed = text.trim();
            if (!trimmed) {
                return null;
            }

            var match = trimmed[0] !== "!";
            if (!match) {
                trimmed = trimmed.substring(1);
            }

            var re = this._looksLikeSimpleFilter(trimmed)
                ? new RegExp(`\.${trimmed.replace(".", "\\.").replace("*", ".*")}$`)
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

    _escapeRegexCharacters: function(str) {
    },

    _looksLikeSimpleFilter: function (filter) {
        // filter is simple if it only contains alphanumerics, periods & wildcard (*)
        const result = Array.from(filter).reduce(
            (a, c) => a && simpleFilterChars.indexOf(c) > -1,
            true);
        return result;
    }
};


module.exports = FilenameFilterLite;