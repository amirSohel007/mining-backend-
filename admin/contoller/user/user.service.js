const userSchema = require('../../../controller/user/user.model');
const { Status } = require('../../../commonHelper');
const jwt = require('jsonwebtoken');
const config = require('../../../config').config();
const adminUserSchema = require('../admin_user/admin_user.model');
const { upload_file_to_s3, get_s3_file } = require('../../../s3_confif');

const allUsers = (status) => {
    return new Promise(async (resolve,reject) => {
        try{
            const users = await userSchema.find({});
            console.log(users);
            if(users && users.length > 0){
                switch(status)
                {
                    case Status.ALL : resolve(users); break;
                    case Status.ACTIVE : resolve(filterActiveUsers(users));break;
                    case Status.INACTIVE : resolve(filterInActiveUsers(users));break;
                }
                
            }else{
                reject(users);
            }
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
            user.save();
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
        try{
            const file = await upload_file_to_s3(qrCodeFilePath);
            const user = await adminUserSchema.findById({_id: admin_id});
            user['qr'] = file.key;
            user.save();
            if(user != null || user != undefined){
                resolve({ message: 'qr saved'});
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

const getAdminQr = () => {
    return new Promise(async (resolve,reject) => {
        try{
            const user = await adminUserSchema.find({});
            if(user != null || user != undefined){
                const qr = await get_s3_file(user[0].qr);
                resolve(qr);
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