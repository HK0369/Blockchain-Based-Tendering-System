var express = require('express');
var router = express.Router();
const ipfsClient = require('ipfs-api');
const projectId = '2DKea6bGTgfm0VfFkKLazMPpYuh';
const projectSecret = 'acdfd321e4a45ace8410d7cbda37565a';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const client = ipfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  apiPath: '/api/v0/',
  headers: {
    authorization: auth
  }
});
let formidable = require('formidable');
let fs = require('fs');

function uploadImageToIPFS(buffer, callBack) {
  client.add(buffer)
    .then(result => {
      console.log(result);
      if (result && result[0] && result[0].path) {
        callBack(result[0].path);
      } else {
        callBack(null); // Handle error: Unable to get path from IPFS response
      }
    })
    .catch(error => {
      console.error("Error uploading to IPFS:", error);
      callBack(null); // Handle error: Upload to IPFS failed
    });
}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('create_new_tender');
});

router.post('/upload_img', function (req, res) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (error, fields, file) {
    if (error) {
      console.error("Form parse error:", error);
      res.status(500).send("Error parsing form data");
      return;
    }

    let imgPath = file.fileupload.filepath;
    if (!imgPath) {
      console.error("No file path provided");
      res.status(400).send("No file path provided");
      return;
    }

    fs.readFile(imgPath, function (err, data) {
      if (err) {
        console.error("Error reading file:", err);
        res.status(500).send("Error reading file");
        return;
      }

      console.log("File read successfully");
      uploadImageToIPFS(data, function (result) {
        if (result) {
          console.log("Image uploaded to IPFS successfully:", result);
          res.send(result);
        } else {
          console.error("Failed to upload image to IPFS");
          res.status(500).send("Failed to upload image to IPFS");
        }
      });
    });
  });
});

module.exports = router;
