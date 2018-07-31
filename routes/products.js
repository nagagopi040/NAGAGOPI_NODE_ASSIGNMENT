var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var db = require('../model/db')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/images");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({
  storage: storage
})

router.get("/", (req, res, next) => {    
    var collection = db.getProductsCollection()
    var query = '{$where: function (id) { return this.id = name}}'
    if(query.includes('where')){
        collection.find({}, {fields: {_id: 0}}).toArray((err, data) => {
            if(data)
                res.json({ products: data });
            else
                res.json({ error : err });
        });
    } else 
        res.json({ message: "No products Available"})
});

router.post("/add", upload.single('productImage'), (req, res, next) => {
    var product = req.body;
    var collection = db.getProductsCollection()
    collection.insert( product, (err, success) => {
        if (err)
            res.status(404).json({ message: err });
        else
            res.status(200).json({ message: success });
    });
});

router.get("/view", (req, res, next) => {
    var id = req.query.id;
    var productName = req.query.productName;
    var collection = db.getProductsCollection()
    if(id){    
        collection.find({id: id}).toArray((err, data) => {
            if (data != null)
                res.json({ product: data });
            else
                res.json({ message: "No product with that id" });
        });
    }else if(productName){    
        collection.find({ productName: productName }).toArray((err, data) => {
            if (data != null)
                res.json({ product: data });
            else
                res.json({ message: "No product with that Name" });
        });
    }else {
        res.json({ message: "NOT FOUND" })
    }
});

router.post("/edit/:id", (req, res, next) => {
    var product = req.body;
    var id = req.params.id;
    var collection = db.getProductsCollection()
    collection.update({ id: id }, { $set: product }, (err, success) => {
        if (err)
            res.status(404).json({ message: err });
        else
            res.status(200).json({ message: success });
    });
});

router.post("/delete/:id", (req, res, next) => {
    var product = req.body;
    var id = req.params.id;
    var collection = db.getProductsCollection()
    collection.deleteOne({ id: id }, (err, success) => {
        if (err)
            res.status(404).json({ message: err });
        else
            res.status(200).json({ message: success });
    });
});

router.get("/search", (req, res, next) => {
    var products = [];
    var product = req.query.productName.toLowerCase();
    var collection = db.getProductsCollection()
    collection.find({ productName: { $regex: product, $options: "$i" } }).toArray((err, data) => {
        if (data[0] != null)
            res.json({ product: data });
        else
            res.json({ message: "No product with this Name" });
    });
});

router.get("/globalSearch", (req, res, next) => {
    var value = req.query.value.toLowerCase();
    var collection = db.getProductsCollection();
    collection.createIndex({
        id: "text",
        productName: "text",
        price: "text",
        InTheBox: "text",
        size: "text",
        category: "text",
        brand: "text",
        color: "text",
    })
    
    collection.find({ $text: { $search: `"${value}"`} }).toArray((err, data) => {
        if (data[0] != null)
            res.json({ product: data });
        else
            res.json({ message: "No details available" });
    });
});

module.exports = router;
