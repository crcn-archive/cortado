// Generated by CoffeeScript 1.6.3
var Clients;

Clients = require("./clients");

exports.require = ["sock.server"];

exports.load = function(sockServer) {
  return new Clients(sockServer);
};
