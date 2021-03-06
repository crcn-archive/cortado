// Generated by CoffeeScript 1.6.3
var bindable, packages;

packages = require("packages");

bindable = require("bindable");

require("colors");

exports.start = function(options) {
  var plug;
  options.cwd = process.cwd();
  plug = packages().require({
    config: new bindable.Object(options)
  }).require(__dirname + "/plugins").load();
  plug.exports.mediator.on("pre reload", "load");
  return plug.exports.mediator.execute("load", function(err) {
    return plug.exports.mediator.execute("open");
  });
};
