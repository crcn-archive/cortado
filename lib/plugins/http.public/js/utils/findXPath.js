// Generated by CoffeeScript 1.6.3
var xpgen, _findCorrectElement, _findRelativeXPath, _findUniqueXPath, _findXPath;

xpgen = require("xpgen");

/*
*/


module.exports = function(element, minDepth) {
  if (minDepth == null) {
    minDepth = 1;
  }
  return _findXPath(element, minDepth);
};

/*
*/


_findXPath = function(element, minDepth) {
  var ce, rxp, uxp;
  ce = _findCorrectElement(element);
  rxp = _findRelativeXPath(ce);
  if ($(ce).attr("id")) {
    return rxp;
  }
  uxp = _findUniqueXPath(ce, rxp, minDepth);
  return uxp;
};

/*
 finds the relative xpath from the parent
*/


_findRelativeXPath = function(element, postfix) {
  var $e, a, attr, nodeName, parent, posibilities, xpath, _i, _j, _len, _len1, _ref;
  $e = $(element);
  nodeName = element.nodeName.toLowerCase();
  parent = $(element.parentNode);
  posibilities = [xpgen().element(nodeName).eq("@id", $e.attr("id")), xpgen().element(nodeName).index("text()[contains(.,'" + $e.text().trim().replace(/'/g, "&pos;") + "')]")];
  _ref = ["name", "placeholder", "class", "href", "value", "alt"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    attr = _ref[_i];
    if (!(a = $e.attr(attr))) {
      continue;
    }
    posibilities.push(xpgen().element(nodeName).eq("@" + attr, a));
  }
  posibilities.push(xpgen().element(nodeName).index(parent.children(element.nodeName).index(element) + 1));
  if (postfix) {
    posibilities = posibilities.map(function(path) {
      return [path, postfix].join("/");
    });
  }
  for (_j = 0, _len1 = posibilities.length; _j < _len1; _j++) {
    xpath = posibilities[_j];
    xpath = String(xpath).substr(1);
    if (parent.xpath(xpath).length === 1) {
      return xpath;
    }
  }
};

/*
 finds the unique xpath from the document
*/


_findUniqueXPath = function(element, rxp, minDepth) {
  var $b, cp, cxpath, depth, xpath;
  xpath = rxp;
  cp = element;
  $b = $(document.body);
  depth = 0;
  while (cp.parentNode) {
    depth++;
    cxpath = "//" + xpath;
    if ($(cp).attr("id") || ($b.xpath(cxpath).length === 1 && depth >= minDepth)) {
      break;
    }
    cp = cp.parentNode;
    xpath = _findRelativeXPath(cp, xpath);
  }
  return cxpath;
};

/*
*/


_findCorrectElement = function(element) {
  var cp;
  cp = element;
  while (cp) {
    if (/INPUT|BUTTON|A/.test(cp.nodeName)) {
      return cp;
    }
    cp = cp.parentNode;
  }
  return cp || element;
};
