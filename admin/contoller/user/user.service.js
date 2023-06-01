const userSchema = require('../../../controller/user/user.model');
const { Status } = require('../../../commonHelper');

const allUsers = (status) => {
    return new Promise((resolve,reject) => {
        try{
            const users = userSchema.find({});
            console.log(users);
            if(users && users.lenght > 0){
                switch(status)
                {
                    case Status.All : resolve(users); break;
                    case Status.Active : resolve(filterActiveUsers(users));break;
                    case Status.InActive : resolve(filterInActiveUsers(users));break;
                }
                
            }else{
                reject(users);
            }
        }catch(err){
            console.log(err);
        }
    })
}

const filterActiveUsers = (users) => {
    return users.filter((user) => user.status === Status.Active); 
}

const filterInActiveUsers = (users) => {
    return users.filter((user) => user.status === Status.InActive); 
}

module.exports = { allUsers };