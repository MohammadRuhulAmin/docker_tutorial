const express = require('express');
const app = express();
const port = 3000;
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

app.get('/test-api',(req,res)=>{
    res.send("test-api called");
});

app.listen(port,()=>{
    console.log("Application is running on port");
    console.log(dbHost,dbUser,dbPass,dbName);
})


