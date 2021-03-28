const mongoose = require('mongoose');
const config = require('../config/database');
const Tag = require('../models/tags');


const ArticleSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    }


});

const Article = module.exports = mongoose.model('Article', ArticleSchema);



module.exports.addArticle = function (newArticle, callback) {

    newArticle.save(callback);
}

