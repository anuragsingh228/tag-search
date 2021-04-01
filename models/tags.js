const mongoose = require("mongoose");

const TagSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
});

const Tag = (module.exports = mongoose.model("Tag", TagSchema));

module.exports.getTagByName = function (name, callback) {
  const query = { name: name };
  Tag.findOne(query, callback);
};

module.exports.addTag = function (newTag, callback) {
  newTag.save(callback);
};
