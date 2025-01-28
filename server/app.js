const express = require('express');
const cors = require('cors');
const routes = require('./route');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // for parsing application/json

// Use routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});