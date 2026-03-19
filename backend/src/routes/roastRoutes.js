const express = require('express');
const multer = require('multer');
const { generateRoast, generateLinkedInRoast, generateResumeRoast, generateRoastBattle } = require('../controllers/roastController');

const router = express.Router();

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and TXT files are allowed"), false);
        }
    }
});

router.post('/', generateRoast);
router.post('/linkedin', generateLinkedInRoast);
router.post('/resume', upload.single('file'), generateResumeRoast);
router.post('/battle', generateRoastBattle);

module.exports = router;
