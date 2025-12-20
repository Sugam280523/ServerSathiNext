const express = require('express');
const router = express.Router();
const Nic__Controller = require('../controllers/Nic__Controller');

// URL: /DataToKrushiSeed/:serialKey/:licNo/:ownerCode/:apiType
// This matches: /DataToKrushiSeed/4995ae867e504c0d/781087788/LCCD2021120007/SCI/
router.get('/DataToKrushiSeed/:licKey/:serialKey/:ownerCode/:apiType', Nic__Controller.index);

module.exports = router;