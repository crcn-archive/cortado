express    = require "express"
browserify = require "browserify-middleware"

exports.require = ["express.server", "tests"]
exports.plugin = (expressServer, tests) ->
  expressServer.use "/test", express.static __dirname
  expressServer.use "/test/js/app.bundle.js", browserify(__dirname + "/js/index.js")
  expressServer.use "/test/js/scripts.bundle.js", browserify(tests.bundle())