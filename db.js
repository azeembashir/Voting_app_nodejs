const mongoose = require('mongoose');
require('dotenv').config();

// define the mongodb url
const mongoUrl = process.env.MONGODB_URL_LOCAL;
// setup mongodb connection
mongoose.connect(mongoUrl);
// get the default connection
// mongoose maintain a default connection object representing the mongodb connection
const db = mongoose.connection;

// define event listener for database connection
db.on('connected', ()=> console.log('connected to mongoDB server'));

// for error
db.on('error', (err)=> console.log('mongoDB connection error', err));


db.on('disconnected', ()=> console.log('disconnected to mongoDB server'));

// now export database connection to server.js
module.exports = db;