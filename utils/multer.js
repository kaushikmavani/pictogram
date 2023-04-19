const multer  = require('multer');
const path = require('path');
const rootDir = require('./rootDir');

const filename = (file) => {
    if(file) {
        return Date.now() + path.extname(file.originalname);
    }
    return null;
}

const uploadProfile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(rootDir, 'public', 'images', 'upload', 'avatars'))
        },
        filename: function (req, file, cb) {
            cb(null, filename(file));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname == "avatar") {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                const err = new Error('Please select only .png, .jpg and .jpeg image format in the avatar field.')
                err.statusCode = 422;
                return cb(err);
            }
        } else {
            cb(null, true);
        }
    }
});

const uploadPost = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(rootDir, 'public', 'images', 'upload', 'posts'))
        },
        filename: function (req, file, cb) {
            cb(null, filename(file));
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname == "image") {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
                cb(null, true);
            } else {
                cb(null, false);
                const err = new Error('Please select only .png, .jpg and .jpeg image format in the image field.')
                err.statusCode = 422;
                return cb(err);
            }
        } else {
            cb(null, true);
        }
    }
});

module.exports = {
    uploadProfile,
    uploadPost
}