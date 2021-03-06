async = require "async"
Tester = require "./tester"
Url    = require "url"

exports.require = [/browser.launchers.*/, "sock.clients", "tests", "config", "mediator"]
exports.load = (launcher, clients, tests, config, mediator) ->
  browsers = config.get("browsers") or []
  limit    = config.get("limit") or 1

  proxyInfo = Url.parse(config.get("proxy"))

  ops = {
    host: config.get("host") ? proxyInfo.hostname ? "localhost",
    port: config.get("port")
  }

  return unless browsers.length

  running = false
  tester =
    run: () ->
      return if running
      running = true
      async.eachLimit browsers, limit, ((browser, next) ->
        tester = new Tester(launcher, browser, clients, ops).run next
      ), (err) ->

        running = false
        hasError = false

        if err?
          hasError = true


  mediator.on "pre open", (message, next) ->
    tester.run()
    next()



