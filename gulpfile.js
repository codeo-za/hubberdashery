const 
  fs = require("fs"),
  path = require("path"),
  debug = require("debug")("gulpfile"),
  gulpTasksFolder = "gulp-tasks"; 
global.requireModule = function (module) {
  var modulePath = [".", gulpTasksFolder, "modules", module].join("/");
  return require(modulePath);
};

try {
  require("require-dir")(gulpTasksFolder);
} catch (e) {
  if (shouldDump(e)) {
    console.error(e);
  } else {
    if (!process.env.DEBUG) {
      console.log([
        "Error occurred.",
        "For more info, set the DEBUG environment variable (eg set DEBUG=*).",
        "If you still get nothing useful, set ALWAYS_DUMP_GULP_ERRORS and report the missed error as an issue"
      ].join("\n"));
    }
  }
  process.exit(1);
}

function shouldDump(e) {
  return process.env.ALWAYS_DUMP_GULP_ERRORS || probablyNotReportedByGulp(e);
}

function probablyNotReportedByGulp(e) {
  var message = (e || "").toString().toLowerCase();
  return [
    /cannot find module/i,
    /referenceerror/i,
    /syntaxerror/i,
    /^Error:/i
  ].reduce((acc, cur) => {
    return acc || message.match(cur)
  }, false);
}
