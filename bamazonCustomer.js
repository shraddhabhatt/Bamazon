var mysql = require("mysql");
var Table = require('cli-table');
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    user: "root",
    password: "root",

    database: "bamazon_db"
});

connection.connect(function(err) {
   if (err) {
       throw err;
   }
   //console.log("Connected as Id: " + connection.threadId);
});

var inq = require('inquirer');

var displayProductList = function(){
    
     var productlist = new Table({
        chars: {
            'top': '═','top-mid': '╤','top-left': '╔','top-right': '╗',
            'bottom': '═','bottom-mid': '╧','bottom-left': '╚','bottom-right': '╝',
            'left': '║','left-mid': '╟',
            'mid': '─','mid-mid': '┼',
            'right': '║','right-mid': '╢','middle': '│'
        },
        head: ['Item Id', 'Product Name', 'Department', 'Price', 'In Stock'],
        colWidths: [10, 30, 20, 10, 10]
    });

    connection.query("SELECT * FROM products", function(err, result, fields) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) {
            var data = result[i];
            productlist.push([data.item_id, data.product_name, data.department_name, data.price, data.stock_quantity]);
        }
        console.log(productlist.toString() + "\n\n");
        getOrder();
    });
    
}
displayProductList();

var getOrder = function(){
       inq.prompt([{
           type: "choices",
           message: "Which product would you like to purchase?? Please enter an item_id \n\n",
           name: "item"
       }]).then(function(data) {
           //take entry -> make number
           data.item = parseInt(data.item);
           //check if entry is a number
           if (isNaN(data.item) === false) {
               var item = data.item;
               connection.query("select max(item_id) as max from products;", function(err, result, fields) {
                    if (err) throw err;
                    
                    if(result[0].max >= item)
                        getQuantity(item); //now ask how much they want
                    else{
                        console.log("\nItem ID does not match\n");
                        getOrder();
                    }
                });
               
           }
           //if NaN have user try again
           else {
               console.log("\nPLEASE ENTER A NUMBER\n");
               getOrder();
            }
        });
}
    
var getQuantity = function(item) {
    inq.prompt([{
        type: "input",
        message: "How many would you like to purchase?? Please enter number \n\n",
        name: "count"
    }]).then(function(data) {
        //take entry -> make number
        data.count = parseInt(data.count);
        //check if entry is a number
        if (isNaN(data.count) === false) {
            var quant = parseInt(data.count);
            confirmOrder(item, quant);
         }
         //if NaN have user try again
         else {
            console.log("PLEASE ENTER A NUMBER");
            getQuantity(item);
        }
    });
}
//verify order details
var confirmOrder = function(item, quant) {

    var query = "SELECT product_name, price, stock_quantity FROM products WHERE ?";
    connection.query(query, { item_id: item }, function(err, res) {

    var custCost = quant * res[0].price;
    var response = "";
    if (quant <= res[0].stock_quantity) {
        inq.prompt({
            name: "confirmOrder",
            type: "confirm",
            message: "Please confirm you want to purchase " + quant + " " + res[0].product_name + " for $" + custCost
        }).then(function(answer) {
            if (answer.confirmOrder === true) {
                    response = "\nAwesome! We are processing your order!\n.....\n.....\n.....\n.....\n.....\n";
                    var quantNew = res[0].stock_quantity - quant;
                    updateDB(item, quantNew);
                } else {
                console.log("\nOkay. See ya later");
                stopDb();
                }
            });
        }else{
                response = "\nSorry, but you've requested more " + res[0].product_name + " than we have available.\n\n";
                console.log(response);
                stopDb();
        }
             
    });
}

//update the database to reflect confirmed order
var updateDB = function(item, quantNew) {
    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: quantNew},{item_id: item}],
        function(err) {
            if (err) throw err;
            console.log("The database has been updated!");
            stopDb();
         }
    )
}
//end db connection
var stopDb = function() {
    connection.end(function(err) {
        if (err) { throw err; }
         console.log("Disconnected from database!\n\n");
    });
}
