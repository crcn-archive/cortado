// Generated by CoffeeScript 1.6.3
var components, nc, paperclip;

paperclip = require("paperclip");

nc = {
  iframe: require("./iframe")
};

components = require("mojojs").models.get("components");

components.set(nc);

paperclip.use(require("paperclip-component")(components));
