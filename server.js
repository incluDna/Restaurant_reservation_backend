const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

dotenv.config({path:'./config/config.env'});

connectDB();

const app = express();
app.use(express.json());

app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
//rate limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000, //10mins
    max: 100
});
app.use(limiter);

//prevent http param pollutions
app.use(hpp());

//enable CORS
app.use(cors());

// Load models first
require("./models/Restaurant");
require("./models/Reservation");
require("./models/Review");

//route files
const restaurants = require ('./routes/restaurants');
const reservations = require('./routes/reservations');
const review = require('./routes/reviews');
const auth = require('./routes/auth');

//mount routers
app.use('/api/v1/restaurants', restaurants)
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/reviews', review);
app.use('/api/v1/auth', auth);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});