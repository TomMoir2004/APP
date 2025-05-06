const express = require('express');
const path = require('path');

const router = express.Router();

// Redirect to login screen by default
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public', 'login.html'));
});

module.exports = router;