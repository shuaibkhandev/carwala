const express = require('express');
const connection  = require('./database/database');
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes')
const brandRoutes = require('./routes/brandRoutes')
const carRoutes = require('./routes/carRoutes')
const cors = require('cors')
const stripeRoutes = require('./routes/stripe');  
const webhookRoute = require('./routes/webhook');  
const CustomersRoute = require('./routes/customer');     
const app = express();

app.use('/webhook', webhookRoute);

app.use(cors());

app.use(express.json())
dotenv.config()

connection();

app.use('/images', express.static('uploads'));


app.use('/api/user',userRoutes);
app.use('/api/brand',brandRoutes);
app.use('/api/car',carRoutes);
app.use('', stripeRoutes);
app.use('/api', CustomersRoute);


app.listen(process.env.PORT,() => {
    console.log('Car Running on port 8000');
})
