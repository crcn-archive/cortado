// Generated by CoffeeScript 1.6.3
exports.require = ["sock.clients", "tests", "mediator"];

exports.load = function(clients, tests, mediator) {
  var controls;
  controls = {
    reload: function() {
      return clients.send({
        event: "reload"
      });
    }
  };
  clients.on("client", function(client) {
    var browser,
      _this = this;
    browser = "Browser";
    client.on("open", function() {
      var _results;
      browser = "(" + client.platform.name + "@" + (client.platform.version.split('.').shift()) + ")";
      _results = [];
      while (browser.length < 12) {
        _results.push(browser += " ");
      }
      return _results;
    });
    client.on("startTests", function(event) {
      mediator.execute("notify", {
        type: "info",
        message: "" + browser + " - tests start"
      });
      return console.log("%s    starting tests", browser);
    });
    client.on("test", function(data) {
      var inf;
      inf = "" + browser + " - " + data.description;
      if (data.error) {
        console.error("%s %s %s", browser, "✘".red, data.description);
        mediator.execute("error", new Error(inf));
        return console.error("%s   ", browser, String(data.error.message).red);
      } else {
        console.log("%s %s %s", browser, "✔".green, data.description);
        return _this.emit("success", {
          message: inf
        });
      }
    });
    return client.on("endTests", function(result) {
      var inf;
      inf = "" + browser + " - success: " + result.successCount + ", errors: " + result.failureCount + ", duration: " + result.duration + " s";
      console.log("%s    %s", browser, "completed tests, success: " + result.successCount + ", errors: " + result.failureCount + ", duration: " + result.duration + " s");
      mediator.execute("notify", {
        type: "info",
        message: inf
      });
      return mediator.execute("completeTests");
    });
  });
  mediator.on("post reload", function(msg, next) {
    controls.reload();
    return next();
  });
  return controls;
};
