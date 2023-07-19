const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config').config();
const moment = require('moment-timezone');
moment.tz('Asia/Kolkata');

//configuring the AWS environment
AWS.config.update({
    accessKeyId: config.s3Bucket.access_key,
    secretAccessKey: config.s3Bucket.secret_access_key
});

var s3 = new AWS.S3();

async function upload_file_to_s3 (filePath) {
    return new Promise((resolve, reject) => {
        try {
          const params = {
            Bucket: config.s3Bucket.bucket_name,
            Body : fs.createReadStream(filePath),
            Key : "receipts/"+moment()+"_"+path.basename(filePath)
          };
          s3.upload(params, function (err, data) {
            //handle error
            if (err) {
              console.log("S3_FILE_UPLOAD_ERROR : ", err);
              throw {
                message: err
              };
            }
            //success
            if (data) {
              console.log("FILE_UPLOADED_AT :", data.Location);
              resolve(data);
            }
          });    
        } catch (error) {
            console.log("S3_FILE_UPLOAD_ERROR_CATCH : ", error);
            reject(error);
        }
    })
}

async function get_s3_file (fileName) {

  return new Promise((resolve, reject) => {
    try {
      const params = { 
        Bucket: config.s3Bucket.bucket_name, 
        Key: fileName,
        signatureVersion: config.signature_version,
        region: config.region 
      };

      // s3.getObject(params, function (err, data) {
      //   if (err) {
      //     throw {
      //       message: err
      //     }
      //   }
      //   else {
      //     console.log('S3_FILE : ', data);  
      //     resolve(data);
      //   }
      // });
      const url = s3.getSignedUrl('getObject', params);
      console.log('S3_FILE_URL : ', url);
      resolve(url);  
    } catch (error) {
        console.log('GET_S3_FILE_ERROR : ', error);
        reject(error);
    }
  });
}

module.exports = { upload_file_to_s3, get_s3_file };