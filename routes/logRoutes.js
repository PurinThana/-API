// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/log/auction/:auction_id', logController.getLogByAuctionId);



module.exports = router;
