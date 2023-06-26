const express = require('express');
const app = express();
const { allUsers,changeUserStatus,changeUserPassword,createAdminUser,saveAdminQr,getAdminQr,getAdminData } = require('./user.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken, getQRCode, deleteAllDirectoryFiles, getBaseUrl } = require('../../../commonHelper');
const multer = require('multer');
const fs = require('fs-extra');

// const Stroage = multer.diskStorage({
//     destination : 'uploads',
//     filename : (req,file,cb) => {
//         cb(null,file.originalname);
//     }
// });

// const upload = multer({storage : Stroage}).single('image');

//Configuration for Multer
// const Stroage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // deleteAllDirectoryFiles('uploads/qr');
//         cb(null, 'uploads');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `qr/${req.user.user_id}_${Date.now()}.${ext}`);
//     } 
// });

const Stroage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = 'uploads/qr'
        fs.emptyDir(folderPath, (err) => {
            if (err) {
                console.log('CLEAR_QR_FOLDER_ERROR : ', err);
            } else {
                console.log('QR_FOLDER_CLEARED SUCCESSFULLY');
                cb(null, folderPath);
            }
        });
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `${req.user.user_id}_${Date.now()}.${ext}`);
    } 
});

const upload = multer({storage : Stroage}).single('image');

app.get('/status/:statusId',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        allUsers(req.params.statusId).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/changestatus',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeUserStatus(req.body.userId,req.body.status).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.post('/changepassword',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        changeUserPassword(req.body.userId,req.body.password).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

// app.post('/register',(req,res) => {
//     try{
//         console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
//         createAdminUser({email:req.body.email,password:req.body.password}).then((result) => {
//             responseService.response(req, null, result, res);
//         }).catch((err) => {
//             responseService.response(req, err, null, res);
//         });
//     }catch(error){
//         responseService.response(req, error, null, res);
//     }
// });

// app.post('/qr',(req,res) => {
//     try{
//         console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
//         upload(req,res,(err) => {
//             if(err){
//                 console.log(err);
//             }else{
//                 saveAdminQr(getUserIdFromToken(req.headers.token),{data:req.file.fieldname,contentType:'image/png'}).then((result) => {
//                     responseService.response(req, null, result, res);
//                 }).catch((err) => {
//                     responseService.response(req, err, null, res);
//                 });        
//             }
//         });
//     }catch(error){
//         responseService.response(req, error, null, res);
//     }
// });

app.post('/qr', upload, (req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        saveAdminQr(getUserIdFromToken(req.headers.token), req.file.filename).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.get('/qr', async (req, res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}${req.baseUrl}${req.path}`);

        try {
            const qrCode = `https://mining-backend.onrender.com/api/qr/${await getQRCode()}`;
            responseService.response(req, null, qrCode, res);
        } catch (error) {
            responseService.response(req, error, null, res);            
        }

    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.get('/',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        getAdminData().then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});


module.exports.user = app;