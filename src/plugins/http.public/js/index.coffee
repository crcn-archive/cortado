# busts with IE
#if window.top isnt window and ~window.location.href.indexOf(window.top.location.href)
#  console.error "cannot run a test window in test window"
#  return

if typeof window.console is "undefined"
  window.console = { }

  window.console.log   = 
  window.console.warn  = 
  window.console.error = 
  window.console.trace = () ->  


require("./views/components")
MainView = require "./views/main"
models   = require "./models"
RemoteClient = require "./client"
Url          = require "url"
findXPath    = require "./utils/findXPath"

window.actions = actions = require("./actions")(models)
window.xpath   = require("xpgen")()
window.expect  = require("expect.js")
window.client  = new RemoteClient()

client.on "reload", () -> 
  window.location.reload()

client.on "runTests", () ->
  mocha.run()

$(document).ready () -> 
  main = new MainView()
  main.attach $ "#application"


mocha.setup({ 
  reporter: require("./reporters/mocha")(models, client)
  ui: "bdd",
  timeout: 1000 * 9999
})


q = Url.parse(window.location.href, true).query ? {}

# q.run?

client.ready () ->
  mocha.run()


