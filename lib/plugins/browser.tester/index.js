// Generated by CoffeeScript 1.6.3
var Tester, async;

async = require("async");

Tester = require("./tester");

exports.require = ["browser.launchers.*", "sock.clients", "tests", "config"];

exports.plugin = function(launcher, clients, tests, config) {
  var browsers, limit, tester;
  browsers = config.get("browsers") || [];
  limit = config.get("limit") || 1;
  tester = {
    run: function(next) {
      return async.eachLimit(browsers, limit, (function(browser, next) {
        return new Tester(launcher, browser, clients).run(next);
      }), function(err) {
        if (err != null) {
          console.error(err.message);
          process.exit(1);
        }
        if (!config.get("keepAlive")) {
          console.log("completed tests without errors");
          return process.exit();
        }
      });
    }
  };
  tests.on("bundle", tester.run);
  return tester;
};