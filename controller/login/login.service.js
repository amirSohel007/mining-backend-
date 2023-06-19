const userSchema = require('../user/user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config').config();
const adminUserSchema = require('../../admin/contoller/admin_user/admin_user.model');

async function loginUser(userEmail, myRefferCode, password) {
    
    try {
        if (!(userEmail && password)) {
          throw {
            status: 400,
            message: "email and password is required",
          };
        }
        const user = await userSchema.findOne({
          $or: [{ email: userEmail }, { my_reffer_code: myRefferCode }],
          password: password,
        });
        const adminUser = await adminUserSchema.findOne({
          email: userEmail,
          password: password,
        });
        if (user && user.password === password) {
            const token = jwt.sign({ user_id: user._id, my_reffer_code: user.my_reffer_code }, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            user.token = token;
            user.save();
            return user;
        }else if(adminUser && adminUser.password === password){
            const token = jwt.sign({ user_id: adminUser._id}, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            adminUser.token = token;
            adminUser.save();
            return adminUser;
        } 
        
        throw {
            status: 401,
            message: 'invalid credential'
        }
    } catch(error) {
        console.log('LOGIN_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = { loginUser };