const multer = require('multer');

const storage = multer.memoryStorage();

// file validation
// const fileFileter = (req,res,cb) => {
//     if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true);
//     } else {
//         cb({message: "Unsupported file format"}, false);
//     }
// }

const singleUpload = multer({storage}).single("file");

module.exports = singleUpload;