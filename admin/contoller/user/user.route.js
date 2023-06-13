const express = require('express');
const app = express();
const { allUsers,changeUserStatus,changeUserPassword,createAdminUser,saveAdminQr,getAdminQr,getAdminData } = require('./user.service');
const responseService = require('../../../response/response.handler');
const { getUserIdFromToken } = require('../../../commonHelper');
const multer = require('multer')

// const Stroage = multer.diskStorage({
//     destination : 'uploads',
//     filename : (req,file,cb) => {
//         cb(null,file.originalname);
//     }
// });

// const upload = multer({storage : Stroage}).single('image');

//Configuration for Multer
const Stroage = multer.diskStorage({ 
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `payment-receipt-image/${req.user.user_id}_${Date.now()}.${ext}`);
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
        saveAdminQr(getUserIdFromToken(req.headers.token), req.file.path).then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
    }catch(error){
        responseService.response(req, error, null, res);
    }
});

app.get('/qr',(req,res) => {
    try{
        console.log(`url : ${req.protocol}://${req.hostname}:3000${req.baseUrl}${req.path}`);
        getAdminQr().then((result) => {
            responseService.response(req, null, result, res);
        }).catch((err) => {
            responseService.response(req, err, null, res);
        });
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