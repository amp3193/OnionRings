const path = require("path");

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/index.html"));
      });
      
      app.get("/style.css", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/style.css"));
      });

      app.get("/app.js", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/app.js"));
      });
      
      app.get("/saved", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/saved.html"));
      });

}