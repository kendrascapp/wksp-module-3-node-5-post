"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const { stock, customers } = require("./data/promo"); //2nd step ex. 2

const checkOrderItemsOutOfStock = checkOrder => {
  let noStock = false;

  if (
    (checkOrder.order === "socks" && stock.socks <= 0) ||
    (checkOrder.order === "bottle" && stock.bottles <= 0) ||
    (checkOrder.size === "small" && stock.shirt.small <= 0) ||
    (checkOrder.size === "medium" && stock.shirt.medium <= 0) ||
    (checkOrder.size === "large" && stock.shirt.large <= 0) ||
    (checkOrder.size === "xlarge" && stock.shirt.xlarge <= 0)
  ) {
    noStock = true;
  }

  return noStock;
};

const handleOrder = (req, res) => {
  const checkOrder = req.body;
  console.log(checkOrder);

  if ("canada" !== checkOrder.country.toLowerCase()) {
    res.send({
      status: "error",
      error: "650"
    });
  } else if (checkOrderItemsOutOfStock(checkOrder)) {
    res.send({
      status: "error",
      error: "450"
    });
  } else {
    // check if customer already has an order
    customers.forEach(customer => {
      if (
        (customer.givenName === checkOrder.givenName &&
          customer.surname === checkOrder.surname) ||
        customer.address === checkOrder.address
      ) {
        res.send({
          status: "error",
          error: "550"
        });
      }
    });
    res.send({
      status: "success"
    });
  }
};

const PORT = process.env.PORT || 7000;

const homePage = (req, res) => {
  res.render("homepage", { title: "to do list", items: toDoArray });
};

const toDoArray = []; //whatever is in this [array] is what will print out in the todo list

const addToList = (req, res) => {
  const newItem = req.body.item;
  toDoArray.push(newItem);
  res.render("homepage", { title: "to do list", items: toDoArray });
};

const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// endpoints

app.get("/", homePage);
app.post("/data", addToList);
app.post("/order", handleOrder); //first step of exercise 2

app.get("*", (req, res) => res.send("Dang. 404."));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
