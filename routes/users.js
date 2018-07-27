var express = require('express');
var router = express.Router();
var db = require('../model/db')
var constant = require('../base/constant')

function validateEmail(emailField) {
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
	if (reg.test(emailField) == false) {
		return false;
	}
	return true;
}
router.post('/edit-profile', (req, res) => {
	var profileid = req.query.profileid;
	var useremail = req.body.email
	if (validateEmail(useremail) == true) {
		var collection = db.getUserCollection();
		collection.find({ profileid: profileid}).toArray((err, data) => {
			if (data[0] == null) {
				res.status(404).json({
					message: constant.NO_USER
				});
			} else {
				if(data[0].email != useremail){
					collection.update({ profileid: req.query.profileid }, { $set: req.body }, (err, success) => {
						if (err)
							res.status(404).json({
								message: err
							});
						else {						
							res.status(200).json({
								message: constant.SUCCESS_MESSAGE
							});
						}
					});
				}else{
					res.status(304).json({
						message: constant.NOT_UPDATED
					});
				}
			}
		});
	} else {
		res.status(404).json({
			Message: constant.INVALID_EMAIL
		});
	}
})

router.get("/getDetails", (req, res, next) => {
	var profileid = req.query.profileid;
	if (profileid) {
		var collection = db.getUserCollection();
		collection.find({ profileid: profileid }, { fields: { _id: 0 } }).toArray((err, data) => {
			if (data[0] != null) {
				res.json({
					userDetails: data
				});
			} else {
				res.json({
					message: constant.NO_USER
				});
			}
		});
	} else {
		res.json({
			message: constant.INVALID_HTTP
		})
	}
})

module.exports = router;