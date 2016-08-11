function Client() {

}
Client.prototype.initialize = function (config) {
    this.config = config;
};

Client.prototype.run = function () {
    console.log("Started client on " + this.config.host + ":" + this.config.port);
    var express = require('express');
    this.app = express();
    var ejs = require('ejs');
    var fs = require('fs');
    if (!fs.existsSync(__dirname + "/client/schemes")) {
        try {
            fs.mkdirSync(__dirname + "/client/schemes");
        }
        catch (e) {
            console.error(e);
        }
    }
    var less = require('less');
    var files = fs.readdirSync(__dirname + "/client/base16");
    files.forEach(function (file) {
        var lessFile = fs.readFileSync(__dirname + "/client/scheme.less");
        less.render(lessFile.toString(), {
            paths: ["./client"],
            globalVars: {name: file.replace(/\.less/i, "")}
        }, function (e, output) {
            fs.writeFileSync(__dirname + "/client/schemes/" + file.replace(/less$/i, "css"), output.css);
        });
    });
    less.render(fs.readFileSync(__dirname + "/client/style.less").toString(), function (e, output) {
        fs.writeFileSync(__dirname + "/client/style.css", output.css);
    });
    var port = this.config.socketPort;
    var domain = this.config.domain;
    var input = fs.readFileSync(__dirname + "/client/config.tpl").toString();
    fs.writeFileSync(__dirname + "/client/config.js", ejs.render(input, {domain: domain, port: port}));
    this.app.set('views', __dirname + '/client');
    this.app.set("view engine", "pug");
    this.app.use(express.static(__dirname + '/client'));
    this.app.use(this.config.proxy.path, express.static(this.config.proxy.localPath));
    this.app.use("/schemes", express.static(__dirname + '/client/schemes'));
    this.app.get("/", function (req, res) {
        res.render("index");
    });

    this.app.listen(this.config.port);
};

module.exports = function () {
    return new Client();
};
