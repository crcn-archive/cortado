events = require "events"

exports.plugin = () ->
  em = new events.EventEmitter()
  publish: () -> em.emit arguments...
  subscribe: () -> em.on arguments...