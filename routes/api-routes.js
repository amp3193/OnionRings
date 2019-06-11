const db = require("../models");

module.exports = function (app) {
// A GET route for scraping 
app.get("/scrape", function(req, res) {
    axios.get("https://www.cbsnews.com/latest/strange/2/").then(function(response) {

      const $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $("article h4").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
          .children("h4")
          .text();
        result.summary = $(this)
            .children("p")
            .text();
        result.link = $(this)
          .children("a")
          .attr("href");
        
        // Create a new story using the `result` object built from scraping
        db.story.create(result)
          .then(function(dbstory) {
            console.log(dbstory);
          })
          .catch(function(err) {
            console.log(err);
          });
      });
      res.send("Scrape Complete");
    });
  });

// GET Route for getting all stories from the db
app.get("/stories", function(req, res) {
    db.story.find({})
      .then(function(dbstory) {
        res.json(dbstory);
      })
      .catch(function(err) {
        res.json(err);
      });
  });
  

}