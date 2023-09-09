const userSchema = require('../user/user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config').config();
const adminUserSchema = require('../../admin/contoller/admin_user/admin_user.model');

async function loginUser(userEmail, myRefferCode, password) {
    
    try {
        if (!(myRefferCode && password)) {
          throw {
            status: 400,
            message: "Referal code and password is required",
          };
        }
        const user = await userSchema.findOne({
          my_reffer_code: myRefferCode.trim(),
          password: password.trim(),
        });
        const adminUser = await adminUserSchema.findOne({
          email: userEmail.trim(),
          password: password.trim(),
        });
        if (user && user.password === password) {
            const token = jwt.sign({ user_id: user._id, my_reffer_code: user.my_reffer_code }, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            user.token = token;
            await user.save();
            return user;
        }else if(adminUser && adminUser.password === password){
            const token = jwt.sign({ user_id: adminUser._id}, config.jwtSecretKey, { expiresIn: config.jwtExpiresIn });
            adminUser.token = token;
            await adminUser.save();
            return adminUser;
        } 
        
        throw {
            status: 401,
            message: 'Invalid credential'
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