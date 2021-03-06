// Generated by CoffeeScript 1.6.3
var LogView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

LogView = (function(_super) {
  __extends(LogView, _super);

  function LogView() {
    _ref = LogView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  LogView.prototype.bindings = {
    "model.success, model.pending": {
      "checkColor": {
        "map": function(success, pending) {
          if (pending) {
            return "blue";
          }
          if (success) {
            return "green";
          }
          return "red";
        }
      },
      "checkText": {
        "map": function(success, pending) {
          if (pending) {
            return ".";
          }
          if (success) {
            return "&#x2714;";
          }
          return "&#x2718;";
        }
      }
    }
  };

  LogView.prototype.paper = require("./index.pc");

  return LogView;

})(require("mojojs").View);

module.exports = LogView;
