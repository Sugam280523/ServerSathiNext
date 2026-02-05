const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/uploads/profiles/',
    filename: (req, file, cb) => {
        cb(null, 'emp-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
module.exports = upload;