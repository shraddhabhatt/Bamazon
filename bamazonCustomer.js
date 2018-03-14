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
   console.log("Connected as Id: " + connection.threadId);
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
    });
}

displayProductList();

