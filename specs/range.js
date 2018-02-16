module.exports = function range(from, to) {
    var result = [];
    if (from > to) {
        var swap = from;
        from = to;
        to = swap;
    }
    for (var i = from; i < to; i++) {
        result.push(i);
    }
    return result;
}
