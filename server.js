
/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: _Mohammed bin obaid Abilail____________ Student ID: _144013208_____________ Date: _06/11/2022______________
*
*  Online (Cyclic) Link: https://gray-combative-coyote.cyclic.app
*
********************************************************************************/



var productService = require('./product-service.js')
var express = require("express")

var app = express()
var HTTP_PORT = process.env.PORT || 8080
var path = require("path")
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

app.use('/public', express.static(path.join(__dirname, "public")));


cloudinary.config({
  cloud_name: 'dee4gk04d',
  api_key: '619721267576237',
  api_secret: 'j2TkPnJu-sQk9CO6x9gge9NO3BQ',
  secure: true
});
const upload = multer();

const stripJs = require('strip-js');
const exphbs = require('express-handlebars')


app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  layoutsDir: 'views/layouts',
  defaultLayout: 'main',
  helpers: {

    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },

    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },

    safeHTML: function (context) {
      return stripJs(context);
    }

  }

}))
app.set('view engine', '.hbs')

app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

function onHttpstart() {
  console.log("Express http server listening on port: " + HTTP_PORT)
}
app.get("/", (req, res) => {
  res.redirect("home")
})


app.get("/home", (req, res) => {
  res.render("home")
})


app.get("/products/add", (req, res) => {
  res.render("addProducts");
})



app.get("/demos", (req, res) => {
  if (req.query.category) {
    productService.getProductsByCategory(req.query.category)
    .then((data) => {
      res.render("demos",{ products: data })
    })

    .catch((err) => {
      res.render("demos",{ message: err })
    })
}

  else if (req.query.minDateStr) {
    productService.getProductsByMinDate(req.query.minDateStr)
    .then((data) => {
      res.render("demos",{ products: data })
    })

    .catch((err) => {
      res.json({ message: err })
    })
  }

  else {
    productService.getAllProducts()
    .then((data) => {
      res.render("demos",{ products: data })
    })

    .catch((err) => {
      res.render("demos", { message: err })
    })
  }

})

app.get("/categories", (req, res) => {
  productService.getCategories()
    .then((data) => {
      res.render("categories", { categories: data })
    })
    .catch((err) => {
      res.render("categories", { message: err })
    })
})


app.post("/products/add", upload.single("featureImage"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processProduct(uploaded.url);
    });
  } else {
    processProduct("");
  }

  function processProduct(imageUrl) {
    req.body.featureImage = imageUrl;
    console.log(req.body)
    productService.addProduct(req.body).then(() => {
      res.redirect('/demos');
    })
      .catch((err) => {
        console.log("i am rendering errorpage...")
        res.render("error", { message: err })
      })

  }

})

app.get('/products', async (req, res) => {

  let data = {};

  try {

    let products = [];

    if (req.query.category) {
      products = await productService.getPublishedProductsByCategory(req.query.category);
    }

    else {
      products = await productService.getPublishedProducts();
    }

    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    let product = products[0];

    data.products = products;
    data.product = product;
    

  } catch (err) {
    data.message = "no results";
  }

  try {

    let categories = await productService.getCategories();

    data.categories = categories;
  } catch (err) {
    data.categoriesMessage = "no results"
  }

  res.render("product", { data: data, })
  

});

app.get('/products/:id', async (req, res) => {

  let data = {};

  try {

    let products = [];

    if (req.query.category) {
      products = await productService.getPublishedproductsByCategory(req.query.category);
    }

    else {
      products = await productService.getPublishedproducts();
    }

    products.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
    data.products = products;

  } catch (err) {
    data.message = "no results";
  }

  try {
    data.post = await productService.getPostById(req.params.id);
  } catch (err) {
    data.message = "no results";
  }

  try {

    let categories = await productService.getCategories();

    data.categories = categories;
  } catch (err) {
    data.categoriesMessage = "no results"
  }


  res.render("product", { data: data })
});

app.use((req, res) => {
  res.render("error", { message: "404 PAGE NOT FOUND" })
})

productService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Express http server listening on ${HTTP_PORT}`)
    })
  })

  .catch(() => {
    console.log("Failesd promises")
  })