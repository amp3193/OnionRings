const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");
const Nightmare = require('nightmare');


module.exports = function (app) {
  // A GET route for scraping 
  // app.get("/scrape", function (req, res) {
  //   axios.get("https://www.cbsnews.com/latest/strange/2/")
  //     .then(scrapeHtml(res.data));
  // });
  // I could not get this to work with my intended news site because the html was dynamically generated 
  // I used Nightmare.js with Cheerio to get the scraped data..no hard feelings Axios

  app.get("/scrape", function (req, res) {
    const nightmare = Nightmare({
      show: false
    })
    const url = "https://www.cbsnews.com/latest/strange/2/";

    nightmare
      .goto(url)
      .wait('body')
      .evaluate(() => document.querySelector('body').innerHTML)
      .end()
      .then(function (html) {
        scrapeHtml(html, res);
      })
      .catch(err => {
        console.log(err);
      });

      console.log('SCRAPE SUBMITTED')
  });

  // GET Route for getting all stories from the db
  app.get("/stories", function (req, res) {
    db.Story.find({})
      .then(function (dbstory) {
        res.json(dbstory);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Route for retrieving all Notes from the db
app.get("/notes", function(req, res) {
  // Find all Notes
  db.Note.find({})
    .then(function(dbNote) {
      res.json(dbNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Story by id, populate it with it's note
app.get("/story/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Story.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbStory) {
      res.json(dbStory);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.post("/story/:id", function(req, res) {
  // Create a new Note in the db
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Story.findOneAndUpdate({}, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function(dbStoryNote) {
      res.json(dbStoryNote);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/stories", function(req, res) {
  // delete all 
  db.Story.deleteMany({})
    .then(function(dbStory) {
      res.json(dbStory);
    })
    .catch(function(err) {
      res.json(err);
    });
});

}


function scrapeHtml(html, res) {
  const $ = cheerio.load(html);
  console.log('SCRAPE LOADED')

  
  $("article").each(function (i, element) {
    
    var result = {};

    result.title = $("h4", "span", element)
      .text()
      .trim();
    result.summary = $("p", "span", element)
      .text()
      .trim();
    result.link = $("a", element)
      .attr("href");

    console.log('SPAN RESULT:', result);

    if (result.title && result.summary && result.link) {
    
      db.Story.create(result)
        .then(function (dbstory) {
          console.log(dbstory);
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  });

  res.send("Scrape Complete - " + new Date().toString());
}