var MongoClient = require('mongodb').MongoClient
var config = require('../config');

var state = {
	db: null,
	usercollection: null,
	productscollection: null
}

exports.connect = function(url, done) {
	if (state.db) return done()

	MongoClient.connect(url, function(err, database) {
		if (err) return done(err)
		state.db = database.db(config.mongodb.dbName)
		state.usercollection = state.db.collection(config.mongodb.collections.users)
		state.productscollection = state.db.collection(config.mongodb.collections.users)
		done()
	})
}

exports.getUserCollection = function() {
  	return state.usercollection
}

exports.getProductsCollection = function() {
  	return state.productscollection
}

exports.close = function(done) {
	if (state.db) {
		state.db.close(function(err, result) {
		state.db = null
		state.mode = null
		done(err)
		})
	}
}