const mongoose = require('mongoose');
const config = require('../config/database');

const TagSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    articles: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    }


});

const Tag = module.exports = mongoose.model('Tag', TagSchema);

module.exports.getTagByName = function (name, callback) {
    const query = { name: name }
    Tag.findOne(query, callback);
}

module.exports.getTagById = function (id, callback) {
    Tag.findById(id, callback);
}

module.exports.addTag = function (newTag, callback) {

    newTag.save(callback);
}