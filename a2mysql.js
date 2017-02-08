var util = require('util');
var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'mysql',
  database : 'fis_assignment2'
  
});

connection.connect();

//************************************
//Functions for accessing the database
//************************************


//........................:::Functions for invoking first command:::................................
function addNewOrder(customerID, callback) {
    var checkCustomer = 'SELECT DISTINCT orders.customer_id FROM orders ORDER BY customer_id ASC;'
    connection.query(checkCustomer, function(err, rows){
      if (err) {
              callback(err);
              return;
          }
      try{if (rows.length < customerID) {
          throw Error ('Customer with ID: \'' + customerID + '\' does not exist. Order cannot be inserted.')
      }}
      catch(err){
          callback(err);
          return;  
      }        
      var insertCustomer = 'INSERT INTO orders (customer_id) VALUES (\'' + customerID + '\');'
      connection.query(insertCustomer, function(err, rows, fields) {
          if (err) {
              callback(err);
              return;
          }
          callback(null, rows, fields);
      });        
    });
}

function addOrderDetails(orderId, itemId, pricePerItem, quantity, callback) {
    var query = 'INSERT INTO order_details (order_id, item_id, price_per_item, quantity) ';
    query = query + 'VALUES (\'' + orderId + '\', \'' + itemId + '\', \'' + pricePerItem + '\', \'' + quantity + '\');';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        } 
        callback(null, rows, fields);
    });
}

//........................:::Functions for invoking second command:::................................
function addNewCustomer(name, phone, address, city, country, callback) {
    var sql = 'INSERT INTO customers (name, phone, address, city, country) ';
    sql = sql + 'VALUES (\'' + name + '\', \'' + phone + '\', \'' + address + '\', \'' + city + '\', \'' + country + '\');';
 
    connection.query(sql, function(err, rows, fields) {
        if (err) {
          console.log(sql);
            callback(err);
            return;
        } 
        callback(null, rows, fields);
    });
}

function addAccountDetails(customerID, user_name, password, callback) {
    var query = 'INSERT INTO customer_accounts (customer_id, user_name, password) ';
    query = query + 'VALUES (\'' + customerID + '\', \'' + user_name + '\', \'' + password + '\');';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        } 
        callback(null, rows, fields);
    });
}

//........................:::Functions for invoking third command:::................................
function deleteOrderAndDetails(orderId, callback) {
    var query = 'DELETE orders, order_details FROM orders INNER JOIN order_details ';
    query = query + 'WHERE orders.id = order_details.order_id AND orders.id = ' + orderId + ';';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        } 
        callback(null, rows, fields);
    });
}

//........................:::Functions for invoking fourth command:::................................
function deleteCustomerAndAccount(customerID, callback) {
    var query = 'DELETE customers, customer_accounts FROM customers INNER JOIN customer_accounts ';
    query = query + 'WHERE customers.id = customer_accounts.customer_id AND customers.id = ' + customerID + ';';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        } 
        callback(null, rows, fields);
    });
}

//........................:::Functions for invoking fifth command:::................................
function totalSumByOrderId(orderId, callback) {
    var query = 'SELECT SUM(order_details.quantity*order_details.price_per_item) ';
    query = query + 'AS sum FROM order_details WHERE order_details.order_id = ' + orderId + ';';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, rows, fields);
    });
}

//........................:::Functions for invoking sixth command:::................................
function nameAndTotalSumByCustomerId(customerID, callback) {
    var query = 'SELECT customers.name, SUM(order_details.quantity*order_details.price_per_item) ';
    query = query + 'AS sum FROM order_details, orders, customers WHERE customers.id = ' + customerID + ' ';
    query = query + 'AND orders.customer_id = customers.id AND order_details.order_id = orders.id;';
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
            return;
        }
        callback(null, rows, fields);
    });
}

//***********************
//Menu handling functions
//***********************

//global variable, which will be reinitialized as function within menus, for handling user input
var menuHandler;

//initializeMenu function is the starting point of menu
function initializeMenu() {
    showMainMenu();
    process.stdin.setEncoding('utf8');
    //assign callback for handling user input
    process.stdin.on('readable', checkMenu);

    function checkMenu() {
        var input = process.stdin.read();
        if(input !== null) {
            //trim whitespace from beginning and end of input string
            input = input.trim();
            //split input into array by whitespace except for those with double quotes
            inputArray = input.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
            //remove double quotes if any
            for (var i = 0; i < inputArray.length; i++) {
                if (inputArray[i].charAt(0) === '"' && inputArray[i].charAt(inputArray[i].length -1) === '"'){
                    inputArray[i] = inputArray[i].substr(1,inputArray[i].length -2);
                }
            }
            //menuHandler takes input array as an input
            menuHandler(inputArray);
        }
    }
}


function showMainMenu() {
    console.log(
        '\n\n' +
        '****************Main menu****************' + '\n' +
        'Invoking command syntax: \'operation number\' \'input values\', if any, separated by whitespace' + '\n' +
        '1 - Add new order with order details for existing customer. Input values: \'customerId\'' + '\n' +
        '2 - Add new customer with customer account. Input values: \'name\' \'phone\' \'address\' \'city\' \'country\'' + '\n' +
        '3 - Delete order with all order details. Input values: \'order_id\'' + '\n' +
        '4 - Delete customer details. Input values: \'customer_id\'' + '\n' +
        '5 - Get total sum of order. Input values: \'order_id\'' + '\n' +
        '6 - Get customer name and total sum of all orders fot this customer. Input values: \'customer_id\'' + '\n' +
        'exit - Exit from program'  + '\n'
        );

    menuHandler = function(input){
        switch(input[0]) {
            case '1':
                    addNewOrder(input[1], function(err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 2) {
                            console.log('The syntax for entering new order is: \'operation number\' and \'customerId\'');
                            showMainMenu();
                            return;
                        }
                        var orderId = rows.insertId;
                        console.log('New order for customer with ID: \'' + input[1] + '\' was inserted. The order ID is: \'' + orderId + '\';');
                        subMenu1(orderId);
                        });
                    break;
            case '2':
                    addNewCustomer(input[1], input[2], input[3], input[4], input[5], function(err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 6) {
                            console.log('The syntax for adding new customer with customer account is: \'operation number\' and \'name\' \'phone\' \'address\' \'city\' \'country\'');
                            showMainMenu();
                            return;
                        }
                        var customerID = rows.insertId;
                        console.log('New customer with ID: \'' + customerID + '\' was inserted.');
                        subMenu2(customerID);
                        });
                    break;
            case '3':
                    deleteOrderAndDetails(input[1], function (err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 2) {
                            console.log('The syntax for Deleting order with all order details is: \'operation number\' and \'order_id\'');
                            showMainMenu();
                            return;
                        }
                        console.log('Order and Order Details for order with ID: \'' + input[1] + '\' was removed successfully.');
                        showMainMenu();
                    });
                    break;
            case '4':
                    deleteCustomerAndAccount(input[1], function (err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 2) {
                            console.log('The syntax for Deleting customer details is: \'operation number\' and \'customer_id\'');
                            showMainMenu();
                            return;
                        }
                        console.log('Customer\'s details and account for customer with ID: \'' + input[1] + '\' was removed successfully.');
                        showMainMenu();
                    });
                    break;
            case '5':
                    totalSumByOrderId(input[1], function (err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 2) {
                            console.log('The syntax for getting total sum of order is: \'operation number\' and \'order_id\'');
                            showMainMenu();
                            return;
                        }
                        console.log('Total sum for orders with ID: \'' + input[1] + '\' is: ' + rows[0].sum + '');
                        showMainMenu();
                    });
                    break;
            case '6':
                    nameAndTotalSumByCustomerId(input[1], function (err, rows, fields){
                        if (err) {
                            console.log('Error: ' + err);
                            showMainMenu();
                            return;
                        }
                        if (input.length !== 2) {
                            console.log('The syntax for getting customer name and total sum of all orders fot the customer is: \'operation number\' and \'customer_id\'');
                            showMainMenu();
                            return;
                        }
                        console.log('The cutomer \'' + rows[0].name + '\' has total sum of orders: ' + rows[0].sum + '');
                        showMainMenu();
                    });
                    break;
            case 'exit':
                    connection.end();
                    process.exit();
                    break;
            default: showMainMenu();
        }
    };
}
 
function subMenu1(orderId) {
    console.log(
        '\n\n' +
        '\t****************Submenu details of new order with order ID: \'' + orderId + '\'****************' + '\n' +
        '\tEnter input variables: \'item_id\', \'price_per_item\' and \'quantity\', separated by whitespace' + '\n' +
        '\tmain - Exit to main menu'  + '\n'
        );
    menuHandler = function(input){
      if (input[0] !== 'main') {
        addOrderDetails(orderId, input[0], input[1], input[2], function(err, rows, fields){
            if (err) {
                 console.log('Error: ' + err);
                 showMainMenu();
                 return;
            }
            if (input.length !== 3) {
                 console.log('The syntax for entering details of new order is: \'item_id\', \'price_per_item\' and \'quantity\'');
                 subMenu1(orderId);
                 return;
            }
        console.log('New records successfully added');
        subMenu1(orderId);
        });
      }
      else{
        showMainMenu();
      }            
    }
}

function subMenu2(customerID) {
    console.log(
        '\n\n' +
        '\t****************Submenu create new account for customer witn ID: \'' + customerID + '\'****************' + '\n' +
        '\tEnter input variables: \'user_name\' \'password\', separated by whitespace' + '\n'
        );
    menuHandler = function(input){
        addAccountDetails(customerID, input[0], input[1], function(err, rows, fields){
            if (err) {
                console.log('Error: ' + err);
                showMainMenu();
                return;
            }
            if (input.length !== 2) {
                 console.log('The syntax for creating new account for customer is: \'user_name\' \'password\'');
                 subMenu2(customerID);
                 return;
            }
        console.log('New account details for customer with ID: \'' + customerID + '\' was inserted.');
        showMainMenu();
        });
    };
}

//start program with menu initialization
initializeMenu();
