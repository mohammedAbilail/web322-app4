const fs = require("fs")
let products = []
let categories = []

exports.initialize = ()=> {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/products.json", 'UTF-8', (err, data) => {
            if (err) {
                reject("No results returned")
                return

            }
            try {
                products = JSON.parse(data)
            }
            catch (err) {
                console.log("Error due to " + err)
            }
        })

        fs.readFile("./data/categories.json", 'UTF-8', (err, data)=> { 
            if (err) {
                reject("No results returned")
                return

            }
            try {
                categories = JSON.parse(data)
            }
            catch (err) {
                console.log("Error due to " + err)
            }
        })
        
        resolve()
    })
}

exports.getAllProducts = ()=> {
    return new Promise(function(resolve, reject){
        if (products.length == 0){
            reject("No results returned")
            return
        }
 
        resolve(products)
    })
}

exports.getPublishedProducts = ()=> {
    return new Promise(function(resolve, reject) {
      let published = products.filter(
        function(product){ return product.published == true}
        )
      if (published.length == 0) {
        reject("No results returned")
        return
      }
      resolve(published)
    })
  }

exports.getCategories = ()=> {
    return new Promise(function(resolve, reject){
        if (categories.length == 0){
            reject("No results returned")
            return
        }
 
        resolve(categories)
    })
}

exports.addProduct = (productData) => {
    return new Promise(function(resolve, reject){
        productData.published = (productData.published) ? true : false;
        productData.postDate = new Date().toISOString().split("T")[0]
        productData.id = products.length + 1;
        products.push(productData);

        resolve();
    })
}

exports.getProductsByMinDate = function (minDateStr) {
    return new Promise(function (resolve, reject) {
        var productsByMinDate = [];

        for (let i = 0; i < products.length; i++) {
            if (new Date(products[i].productDate) >= new Date(minDateStr)) {
                console.log("The productDate value is greater than minDateStr")
                productsByMinDate.push(products[i]);
            }
        }

        if (productsByMinDate.length == 0) {
            reject("No result returned");
            return;
        }

        resolve(productsByMinDate);
    });
  
}

exports.getproductById = function (id) {
    return new Promise(function (resolve, reject) {
        var productById = [];
        
        for (let i = 0; i < products.length; i++) {
            if (products[i].id == id) {
                productById.push(products[i]);
            }
        }

        if (productById.length == 0) {
            reject("No result returned");
            return;
        }

        resolve(productById);
    });
}

exports.getProductsByCategory = function (category) {
    return new Promise(function (resolve, reject) {
        var productsByCategory = [];

        for (let i = 0; i < products.length; i++) {

            if (poroducts[i].category == category) {
                productsByCategory.push(products[i]);
            }
        }

        if (productsByCategory.length == 0) {
            reject("No result returned");
            return;
        }

        resolve(productsByCategory);
    });
}

exports.getPublishedProductsByCategory = (category) => {
    return new Promise((resolve, reject) => {
        
      let output = products.filter(
        (product) => product.published == true && product.category == category
      )
      
      if (!output.length) {
        console.log("nothing here")
        reject("No results returned")
        return;
      }
      
      else {
        console.log(output)
        resolve(output);
      }
    })
}