const express = require('express');

const router = express.Router();

// GET
router.get('/image', (req, res, next) => {
    res.send('GET IMAGE');
});

// POST
router.post('/image', (req, res, next) => {
    res.send('POST IMAGE');
});

// Export router
module.exports = router;
