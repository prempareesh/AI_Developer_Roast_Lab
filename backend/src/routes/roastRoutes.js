const express = require('express');
const multer = require('multer');
const { generateRoast, generateLinkedInRoast, generateResumeRoast, generateRoastBattle } = require('../controllers/roastController');

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', generateRoast);
router.post('/linkedin', generateLinkedInRoast);
router.post('/resume', upload.single('resumeFile'), generateResumeRoast);
router.post('/battle', generateRoastBattle);

module.exports = router;
