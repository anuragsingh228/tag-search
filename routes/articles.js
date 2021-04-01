const express = require("express");
const router = express.Router();
const Article = require("../models/articles");
const Tag = require("../models/tags");
var ObjectId = require("mongoose").Types.ObjectId;

/***********************************  Get all articles    *****************************************************/

//Will fetch articles dynamically----  /?a=x&a=y&a=z ||||   will give   ['x', 'y', 'z']

/********************************************************************************************************** */
router.get("/", (req, res, next) => {
  if (req.query.a == undefined) {
    filtertags = [];
  } else {
    filtertags = req.query.a;
  }
  if (filtertags.length === 0) {
    Article.find((err, articles) => {
      if (err) {
        console.log(err);
        res.status(400);
      } else {
        res.status(200).json({
          message: "Articles fetched succesfuly!",
          posts: articles,
        });
      }
    });
  } else {
    Article.find({ tags: { $all: filtertags } }, (err, articles) => {
      if (err) {
        console.log(err);
        res.status(400);
      } else {
        res.status(200).json({
          message: "Articles fetched succesfuly!",
          posts: articles,
        });
      }
    });
  }
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
      tagArray = article.tags;
      for (let index = 0; index < tagArray.length; index++) {
        Tag.findOne({ name: tagArray[index] }, (err, tag) => {
          if (err) {
            console.log(err);
          } else {
            if (tag != undefined && tag.count >= 1) {
              Tag.update(
                { name: tagArray[index] },
                { $inc: { count: 1 } },
                (err, doc) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("tag saved");
                  }
                }
              );
            } else {
              const newTag = new Tag({
                name: tagArray[index],
                count: 1,
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
      res.json({ msg: "Article Added", articleId: article._id });
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
  newtags = narticle.tags;
  for (let index = 0; index < newtags.length; index++) {
    Tag.findOne({ name: newtags[index] }, (err, tag) => {
      if (err) {
        console.log(err);
      } else {
        if (tag != undefined && tag.count >= 1) {
          Tag.update(
            { name: newtags[index] },
            { $inc: { count: 1 } },
            (err, doc) => {
              if (err) {
                console.log(err);
              } else {
                console.log("tag saved");
              }
            }
          );
        } else {
          const newTag = new Tag({
            name: newtags[index],
            count: 1,
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

  Article.findByIdAndUpdate(
    req.params.id,
    { $set: narticle },
    (err, article) => {
      if (err) {
        console.log(err);
      } else {
        oldtags = article.tags;
        for (let index = 0; index < oldtags.length; index++) {
          Tag.findOne({ name: oldtags[index] }, (err, tag) => {
            if (err) {
              console.log(err);
            } else {
              Tag.update(
                { name: oldtags[index] },
                { $inc: { count: -1 } },
                (err, doc) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("tag saved");
                    Tag.remove(
                      { name: tag.name, count: { $lt: 1 } },
                      (err, doc) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("tag deleted");
                        }
                      }
                    );
                  }
                }
              );
            }
          });
        }

        res.json({ success: true, msg: "Article Updated" });
      }
    }
  );
});

/************************************   Delete an Article   ********************************/
router.delete("/delete/:id", (req, res, next) => {
  oldtags = [];
  Article.findById(req.params.id, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      oldtags = doc.tags;
      for (let index = 0; index < oldtags.length; index++) {
        Tag.findOne({ name: oldtags[index] }, (err, tag) => {
          if (err) {
            console.log(err);
          } else {
            Tag.update(
              { name: oldtags[index] },
              { $inc: { count: -1 } },
              (err, doc) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("tag saved");
                  Tag.remove(
                    { name: tag.name, count: { $lt: 1 } },
                    (err, doc) => {
                      if (err) {
                        console.log(err);
                      } else {
                        console.log("tag deleted");
                      }
                    }
                  );
                }
              }
            );
          }
        });
      }
    }
  });

  Article.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: "Post Deleted" });
  });
});

/*********************************  Get all tags   **************************************/
router.get("/all/tags", (req, res, next) => {
  alltags = [];
  Tag.find((err, tags) => {
    if (err) {
      console.log(err);
    } else {
      for (let index = 0; index < tags.length; index++) {
        alltags.push(tags[index].name);
      }
      res.status(200).json({ message: "allatgs", alltags: alltags });
    }
  });
});

module.exports = router;
