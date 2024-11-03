
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.get('/auction', auctionController.getAllAuctions);
router.get('/auction/:id', auctionController.getAuctionById);
router.get('/auction/code/:code', auctionController.getAuctionByCode);
router.post('/auction', auctionController.createAuction);
router.put('/auction/:id', auctionController.updateAuction);
router.delete('/auction/:id', auctionController.deleteAuction);
router.get('/user-auction/:id', auctionController.getAllInAuctions)
module.exports = router;
