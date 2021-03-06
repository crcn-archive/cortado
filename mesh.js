var child_process = require("child_process"),
exec = child_process.exec,
spawn = child_process.spawn,
path = require("path"),
async = require("async"),
_ = require("underscore"),
fs = require("fs");
require("colors"),
request = require("request"),
mkdirp = require("mkdirp"),
jsdev = require("jsdev"),
outcome = require("outcome"),
pkg = require("./package.json");

module.exports = function(mesh, next) {

  var processStylusTimeout,
  processStylusContent = [],
  brokenFiles = {},
  processStylusOutput = __dirname + "/lib/plugins/http.public/css/app.less",
  osxNotifierPort = 18449,
  runningNotifier = false,
  buildNum = String(Date.now())

  function startOsxNotifier() {
    runningNotifier = true;
    console.log("starting node osx notifier");
    var proc = spawn("./node_modules/.bin/node-osx-notifier", [osxNotifierPort], { cwd: __dirname })
    proc.on("exit", function() {
      setTimeout(startOsxNotifier, 5000);
    });

    logProc(proc);
  }

  function logProc(proc) {
    proc.stdout.on("data", function(buffer) {
      process.stdout.write(buffer);
    });
    proc.stderr.on("data", function(buffer) {
      process.stderr.write(buffer);
    });
    return proc;
  }

  function notifyMessage2(msg, file) {
    if(!runningNotifier) return;
    request.get("http://localhost:" + osxNotifierPort + "/info?message=" + msg + "&title=dojo");
  }

  function notifyMessage(err, file) {

    if(!err) {
      /*if(brokenFiles[file]) {
        delete brokenFiles[file];
        notifyMessage2("fixed " + relPath(file));
      }*/
      return;
    }

    //brokenFiles[file] = 1;
    console.error(String(err.message).red)
    notifyMessage2("cannot process " + relPath(file), file);
  }


  function relPath(path) {
    return path.replace(__dirname, ".")
  }

  var processStylusDebounced = function(context) {
    var input = context.get("input");

    try {

      var item = processStylusContent.filter(function(item) {
        return item.input == input;
      }).shift();


      if(item) {
        processStylusContent.splice(processStylusContent.indexOf(item), 1)
      }

      processStylusContent.push({
        input: input,
        content: fs.readFileSync(input, "utf8"),
        priority: input.split("/").length
      })
    } catch(e) {
      console.error(e.stack)
    }

    clearTimeout(processStylusTimeout);
    processStylusTimeout = setTimeout(processStylus, 1000);
  };

  var processStylus = function() {

    var buffer = [], cmd;


    processStylusContent.sort(function(a, b) {
      return a.priority > b.priority ? 1 : -1;
    }).forEach(function(styl) {
      buffer.push(styl.content);
    });

    mkdirp.sync(path.dirname(processStylusOutput));


    fs.writeFileSync(processStylusOutput, buffer.join("\n"));


    exec(cmd = "./node_modules/.bin/lessc " + processStylusOutput + " > " + processStylusOutput.replace(".less", ".css"), { cwd: __dirname }, function(err, stderr, stdout) {
      process.stderr.write(stderr);
      process.stdout.write(stdout);
    });

    console.log(cmd);
  }

  mesh.run({

    /**
     * builds the site
     */

    "def build-front": {
      "public": true,
      "description": "builds the project",
      "inherit": ["build-src", "build-interm"],
      "run": [
        "build-src",
        "build-interm"
      ]
    },



    /**
     */

    "def build-src": {
      "public": true,
      "description": "builds the ./src dir",
      "inherit": ["eachFile"],
      "params": {
        "usp": {
          "description": "build for production"
        },
        "staging": {
          "description": "build for staging"
        },
        "debug": {
          "description": "debug mode"
        }
      },
      "run": [
        function(context, next) {
          if(context.get("watch")) {
            startOsxNotifier();
          }
          next();
        },
        {
          "eachFile": {
            "input": __dirname + "/src/**",
            "inputBaseDir": "/src",
            "outputBaseDir": "/lib",
            "parallel": 30,
            "run": ["process_file"]
          }
        }
      ]
    },

    /**
     */

    "def build-public-vendor": {
      "public": true,
      "description": "rebuilds public vendor files",
      "run": [
        "build-interm"
      ]
    },

    /**
     */

    "def build-interm": {
      "public": true,
      "description": "./builds the ./interm dir",
      "inherit": ["eachFile"],
      "run": {
        "eachFile": {
          "watch": false,
          "input": __dirname + "/interm/**",
          "ignoreFileTypes": ["coffee", "pc"],
          "inputBaseDir": "/interm",
          "outputBaseDir": "/public",
          "parallel": 30,
          "run": ["process_file"]
        }
      }
    },

    /**
     * determines what the given file, and how to process it
     */

    "def process_file": {
      "run": function(context, next) {
        var input = context.get("input");

        //skip
        if(~input.indexOf("node_modules")) {
          //console.log("skip %s".grey, relPath(input));
          return setTimeout(next, 0);
        }

        //setup the output directory - build
        context.set("output", input.replace(context.get("inputBaseDir"), context.get("outputBaseDir")));

        var self = this, cmd, ignoreFileTypes = context.get("ignoreFileTypes") || [];

        function onDone(err) {
          notifyMessage(err, input);
          console.log("%s %s -> %s", cmd, relPath(context.get("input")), relPath(context.get("output")));
          next();
        }
        var fileType = input.split(".").pop();

        if(~ignoreFileTypes.indexOf(fileType)) {
          //console.log("skip %s".grey, relPath(context.get("input")));
          return onDone();
        }

        this.run(cmd = "process_" + input.split(".").pop(), context, function(err) {
          if(err) {
            if(err.code != 404) {
              notifyMessage(err, input);
            }
            return self.run(cmd = "process_copy", context, onDone);
          } else {
            onDone();
          }
        });
      }
    },

    /**
     * process coffee files
     */

    "def process_coffee": {
      "run": function(context, next) {
        var output;
        exec("./node_modules/.bin/coffee -b -o " + path.dirname(output = context.get("output")) + " -c " + context.get("input"), outcome.e(next).s(function() {
          try {
            output = output.replace(/coffee$/, "js");
            var flags = []
            if(context.get("debug")) {
              flags.push("debug");
            }

            content = jsdev.modifyContent(fs.readFileSync(output, "utf8"), flags)
            fs.writeFileSync(output, content);
          } catch(e) {
            console.warn(e.message.yellow);
          }
          next();
        }));
      }
    },

    /**
     * processes paperclip files
     */

    "def process_pc": {
      "run": function(context, next) {
        var output = context.get("output") + ".js";
        context.set("output", output);

        var cmd = "rm -f " + output + "; ./node_modules/.bin/paperclip -p -i " + context.get("input") + " -o " + output;

        exec(cmd, next);
      }
    },

    /**
     */

    "def process_less": {
      "run": function(context, next) {
        processStylusDebounced(context);
        next();
      }
    },

    /**
     * processes regular files - just copies them over
     */

    "def process_copy": {
      "run": ["copy"]
    }
  }, next);
}