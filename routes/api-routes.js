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
      .evaluate(() => {
        console.log('evaluating HTML for scrape')
        return document.querySelector('body').innerHTML;
      })
      .end()
      .then(function (html) {
        console.log('HTML retrieved for scrape')
        scrapeHtml(html, res);
      })
      .catch(err => {
        console.log(err);
      });
    console.log('SCRAPE SUBMITTED')
  });

  // GET Route for getting all stories from the db
  app.get("/stories", function (req, res) {
    const where = {};

    if (req.query.saved) {
      if (req.query.saved === 'true') {
        where.saved = true;
      } else if (req.query.saved === 'false') {
        where.saved = false;
      }
    }

    console.log('finding stories', where)

    db.Story.find(where)
      .then(function (dbstory) {
        res.json(dbstory);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Route for grabbing a specific Story by id, populate it with it's note
  app.get("/story/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Story.findOne({
        _id: req.params.id
      })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function (dbStory) {
        res.json(dbStory);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  // Updating story to saved
  app.put("/story/:id", function (req, res) {
    console.log('received save request', req.params.id)
    db.Story.updateOne({
        _id: req.params.id
      }, {
        saved: true
      })
      .then(function (value) {
        console.log('processed save request', req.params.id, value)
        res.json(value);
      });
  });

  // updating the notes for a single story
  app.post("/story/:id", function (req, res) {
    console.log("broken thing", req.body)
    // Create a new Note in the db
    db.Note.create(req.body)
      .then(function (dbNote) {
        return db.Story.updateOne({
          _id: req.params.id,
        }, {
          note: dbNote._id
        });
      })
      .then(function (dbStoryNote) {
        res.json(dbStoryNote);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  app.delete("/story/:id", function (req, res) {
    // delete all 
    db.Story.deleteOne({
        _id: req.params.id
      })
      .then(function (dbStory) {
        res.json(dbStory);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  app.delete("/note/:id", function (req, res) {
    // delete all 
    db.Note.deleteOne({
        _id: req.params.id
      })
      .then(function (dbStory) {
        res.json(dbStory);
      })
      .catch(function (err) {
        res.json(err);
      });
  });

  app.delete("/stories", function (req, res) {
    // delete all 
    db.Story.deleteMany({})
      .then(function (dbStory) {
        res.json(dbStory);
      })
      .catch(function (err) {
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
    result.saved = false;

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