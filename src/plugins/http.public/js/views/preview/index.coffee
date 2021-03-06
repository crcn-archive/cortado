
class Preview extends require("mojojs").View
  
  ###
  ###

  define: ["location"]
  
  ###
  ###

  paper: require("./index.pc")
  
  ###
  ###

  bindings: 
    "models.control.location": "location"
    "location": (v) ->
      @set "models.control.document", undefined
      
  ###
  ###

  _onIFrameLoad: () =>

    try 
      $iframe = @$("iframe")
      iframe = $iframe[0]
      win = iframe.contentWindow or iframe
      doc = $iframe.contents()[0]

      if win.location.pathname is "/test"
        return win.location = "/"
      
      return if doc is document
      @set "models.control.document", doc
      @set "models.control.window", win
    catch e
      console.warn e
      @set "models.control.document", document

module.exports = Preview