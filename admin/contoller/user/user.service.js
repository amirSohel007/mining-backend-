const userSchema = require('../../../controller/user/user.model');
const { Status } = require('../../../commonHelper');

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

module.exports = { allUsers,changeUserStatus,changeUserPassword };