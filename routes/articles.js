const express = require("express");
const _ = require("lodash");
const router = express.Router();
const Article = require("../models/articles");
const Tag = require("../models/tags");
var ObjectId = require("mongoose").Types.ObjectId;
/***********************************  Get all articles    *****************************************************/

router.get("/", (req, res, next) => {
  Article.find((err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json({
        message: "Articles fetched succesfuly!",
        posts: articles,
      });
    }
  });
});

/****************************************   Adding New Article    ******************************************/

router.post("/addarticle", (req, res, next) => {
  let newArticle = new Article({
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
  });

  Article.addArticle(newArticle, (err, article) => {
    if (err) {
      res.json({ success: false, msg: "Failed to add article" });
    } else {
      console.log(article);
      tagArray = article.tags;
      for (let index = 0; index < tagArray.length; index++) {
        console.log(tagArray[index]);
        Tag.findOne({ name: tagArray[index] }, (err, tag) => {
          console.log("index", index, tag);
          if (err) {
            console.log(err);
          } else {
            if (!_.isEmpty(tag)) {
              Tag.update(
                { name: tagArray[index] },
                { $push: { articles: article._id } },
                (err, doc) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("tag saved");
                  }
                }
              );
            } else {
              console.log("************************************");
              console.log(index);
              console.log(tagArray[index]);

              const newTag = new Tag({
                name: tagArray[index],
                articles: [article._id],
              });

              Tag.addTag(newTag, (err, demotag) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("tag added");
                }
              });
            }
          }
        });
      }
      res.json({ success: true, msg: "Article Added" });
    }
  });
});

/*******************************************   Retrieve an Existing Article by Id  ********************************/

router.get("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("No article with given Id");
  }
  Article.findById(req.params.id, (err, article) => {
    if (err) {
      console.log(err);
    } else {
      res.send(article);
    }
  });
});

/*****************************************  Update an existing Article   *****************************************/
router.put("/:id", (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send("No article with given Id");
  }

  var narticle = {
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
  };

  Article.findByIdAndUpdate(
    req.params.id,
    { $set: narticle },
    { new: true },
    (err, article) => {
      if (err) {
        console.log(err);
      } else {
        console.log(article);
        tagArray = article.tags;
        for (let index = 0; index < tagArray.length; index++) {
          console.log(tagArray[index]);
          Tag.findOne({ name: tagArray[index] }, (err, tag) => {
            console.log("index", index, tag);
            if (err) {
              console.log(err);
            } else {
              if (_.isEmpty(tag)) {
                console.log("************************************");
                console.log(index);
                console.log(tagArray[index]);

                const newTag = new Tag({
                  name: tagArray[index],
                  articles: [article._id],
                });

                Tag.addTag(newTag, (err, demotag) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("tag added");
                  }
                });
              }
            }
          });
        }
        res.json({ success: true, msg: "Article Updated" });
      }
    }
  );
});

module.exports = router;
