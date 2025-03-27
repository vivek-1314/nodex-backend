const express = require('express');
const connectiontomongodb = require('./connection');
const userroute = require('./routes/user')
const searchroute = require('./routes/search_route') ;
const postroute = require('./routes/post_routes') ;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

const url = process.env.MONGODBATLASURL ;
connectiontomongodb(url);

app.use(express.json());
app.use(cors());
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/user" , userroute);
app.use("/search" , searchroute);
app.use("/post" , postroute );

app.listen(port , () =>console.log(`server listening at ${port}`))