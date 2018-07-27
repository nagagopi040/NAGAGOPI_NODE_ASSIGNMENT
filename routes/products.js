var express = require("express");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const multer = require('multer')

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null, "./public/images");
  },
  filename: function(req, file, callback) {
      callback(null, file.originalname);
  }
});

var upload = multer({
  storage: storage
})

router.get("/", (req, res, next) => {
  var products = [];
  MongoClient.connect(url, (err, database) => {
    var db = database.db("fagropsDB");
    db
      .collection("products")
      .find({}, {
        fields: {
          _id: 0
        }
      })
      .toArray((err, data) => {
        res.json({
          products: data
        });
      });
    database.close();
  });
});

router.post("/add", upload.single('productImage'), (req, res, next) => {
  var product = req.body;
  MongoClient.connect(url, (err, database) => {
    var db = database.db("fagropsDB");
    db.collection("products").insert(product, (err, success) => {
      if (err)
        res.status(404).json({
          message: err
        });
      else
        res.status(200).json({
          message: success
        });
    });
    database.close();
  });
});

router.get("/view", (req, res, next) => {
  var product = [];
  var id = req.query.id;
  var productName = req.query.productName;
  MongoClient.connect(url, (err, database) => {
    var db = database.db("fagropsDB");
    if (id) {
      db
        .collection("products")
        .find({
          id: id
        })
        .toArray((err, data) => {
          if (data[0] != null)
            res.json({
              product: data
            });
          else
            res.json({
              message: "No product with that id"
            });
        });
    } else if (productName) {
      db
        .collection("products")
        .find({
          productName: productName
        })
        .toArray((err, data) => {
          if (data[0] != null)
            res.json({
              product: data
            });
          else
            res.json({
              message: "No product with that id"
            });
        });
    } else res.json({
      message: "No data for this product"
    });
    database.close();
  });
});

router.post("/edit/:id", (req, res, next) => {
  var product = req.body;
  var id = req.params.id;
  MongoClient.connect(url, (err, database) => {
    var db = database.db("eStoreDB");
    db.collection("products").update({
        id: id
      }, {
        $set: product
      },
      (err, success) => {
        if (err)
          res.status(404).json({
            message: err
          });
        else
          res.status(200).json({
            message: success
          });
      }
    );
    database.close();
  });
});

router.post("/delete/:id", (req, res, next) => {
  var product = req.body;
  var id = req.params.id;
  MongoClient.connect(url, (err, database) => {
    var db = database.db("eStoreDB");
    db.collection("products").deleteOne({
        id: id
      },
      (err, success) => {
        if (err)
          res.status(404).json({
            message: err
          });
        else
          res.status(200).json({
            message: success
          });
      }
    );
    database.close();
  });
});

router.get("/search", (req, res, next) => {
  var products = [];
  var product = req.query.productName.toLowerCase();
  MongoClient.connect(url, (err, database) => {
    var db = database.db("eStoreDB");
    db
      .collection("products")
      .find({
        productName: {
          $regex: product,
          $options: "$i"
        }
      })
      .toArray((err, data) => {
        if (data[0] != null)
          res.json({
            product: data
          });
        else
          res.json({
            message: "No product with this Name"
          });
      });
    database.close();
  });
});

router.get("/globalSearch", (req, res, next) => {
  var products = [];
  var value = req.query.value.toLowerCase();
  console.log(`${value}`)
  MongoClient.connect(url, (err, database) => {
    var db = database.db("eStoreDB");
    db
      .collection("products").createIndex({
        id: "text",
        productName: "text",
        price: "text",
        InTheBox: "text",
        size: "text",
        category: "text",
        brand: "text",
        color: "text",
      })
    db
      .collection("products")
      .find({
        $text: {
          $search: `"${value}"`
        }
      })
      .toArray((err, data) => {
        if (data[0] != null)
          res.json({
            product: data
          });
        else
          res.json({
            message: "No details available"
          });
      });
    database.close();
  });
});

module.exports = router;