var
    gulp = requireModule("gulp-with-help"),
    browserify = require("gulp-browserify"),
    header = require("gulp-header"),
    footer = require("gulp-footer"),
    os = require("os"),
    rename = require("gulp-rename"),
    fs = require("fs");

gulp.task("build", "builds the tampermonkey artifact in /dist", () => {
    return gulp.src("src/index.js")
        .pipe(browserify({
        }))
        .pipe(header(`${os.EOL}(function() {${os.EOL}`))
        .pipe(header(readTextFile("src/tampermonkey-header.js")))
        .pipe(footer(`${os.EOL}})();`))
        .pipe(rename("tampermonkey.js"))
        .pipe(gulp.dest("dist"));
});

function readTextFile(filePath) {
    return fs.readFileSync(filePath, { encoding: "utf-8" });
}