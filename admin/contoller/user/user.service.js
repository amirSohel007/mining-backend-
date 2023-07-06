const userSchema = require('../../../controller/user/user.model');
const { Status, getBaseUrl } = require('../../../commonHelper');
const jwt = require('jsonwebtoken');
const config = require('../../../config').config();
const adminUserSchema = require('../admin_user/admin_user.model');
const { upload_file_to_s3, get_s3_file } = require('../../../s3_confif');
const qrCodeSchema = require('../qr/qr.model');

const allUsers = (status) => {
    return new Promise(async (resolve,reject) => {
        try{
            const users = await userSchema.find({}).populate('income');
            console.log(users);
            if(users && users.length > 0){
                switch(status)
                {
                    case Status.ALL : resolve(users); break;
                    case Status.ACTIVE : resolve(filterActiveUsers(users));break;
                    case Status.INACTIVE : resolve(filterInActiveUsers(users));break;
                }
                
            }
            resolve(users);
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}

const changeUserStatus = (user_id,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const users = await userSchema.findOneAndUpdate({ _id: user_id },{status : status});
            console.log(users);
            if(users){
                resolve({ message: 'status updated'})
            }else{
                reject({ message: 'user not found'})
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}

const changeUserPassword = (user_id,password) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const users = await userSchema.findOneAndUpdate({ _id: user_id },{password : password});
            console.log(users);
            if(users){
                resolve({ message: 'password updated'})
            }else{
                reject({ message: 'user not found'})
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}

const filterActiveUsers = (users) => {
    return users.filter((user) => user.status === Status.ACTIVE); 
}

const filterInActiveUsers = (users) => {
    return users.filter((user) => user.status === Status.INACTIVE); 
}

const createAdminUser  = (data) => {
    return new Promise(async (resolve,reject) => {
        try{
            const user = await adminUserSchema.create(data);
            const token = jwt.sign({ user_id: user._id }, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            user.token = token;
            await user.save();
            if(user != null || user != undefined){
                resolve(user);
            }else{
                reject({ message: 'some error occured'})
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

const saveAdminQr = (admin_id, qrCodeFilePath) => {
    return new Promise(async (resolve,reject) => {
        try {
            let file = qrCodeFilePath;
            if (config.useS3) {
                file = await upload_file_to_s3(qrCodeFilePath);
            }
            const user = await adminUserSchema.findById({_id: admin_id});
            const qrCode = await qrCodeSchema.findOne({});
            if (qrCode) {
                qrCode['qr'] = file.key ? file.key : file;
                qrCode.updated_by = user._id
                await qrCode.save();
            } else {
                qrCodeSchema.create({
                    qr: file.key ? file.key : file,
                    created_by: user._id,
                    updated_by: user._id
                })
            }
            if(user != null || user != undefined){
                resolve({ message: 'qr code saved' });
            }else{
                reject({ message: 'admin user not found' });
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

const getAdminQr = (req) => {
    return new Promise(async (resolve,reject) => {
        try{
            const qrCode = await qrCodeSchema.findOne({});
            console.log('QR_CODE : ', qrCode);
            if(qrCode != null || qrCode != undefined) {
                let qr = '';
                console.log('USE_S3 : ', config.useS3);
                if (config.useS3) {
                    qr = await get_s3_file(user.qr);
                } else {
                    qr = `${getBaseUrl(req)}/${qrCode._doc.qr}`
                }
                console.log('USE_S3 : ', qr);
                resolve(qr);
            }else{
                reject({ message: 'QR Code not found, please upload QR Code first.'});
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

const getAdminData = () => {
    return new Promise(async (resolve,reject) => {
        try{
            const user = await adminUserSchema.find({});
            if(user != null || user != undefined){
                resolve(user[0]);
            }else{
                reject({ message: 'some error occured'});
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    });
}

module.exports = { allUsers,changeUserStatus,changeUserPassword,createAdminUser,saveAdminQr,getAdminQr,getAdminData };