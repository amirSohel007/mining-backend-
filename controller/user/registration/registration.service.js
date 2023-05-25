const userSchema = require('../user.model');
const crypto = require("crypto");

async function createUser (data) {
    try {
        if (data && data.full_name) {
            let myRefferCode = ''
            if (data.full_name) {
                let randomNumber = crypto.randomInt(0, 1000000);
                randomNumber = randomNumber.toString().padStart(4, "0");
                let name = data.full_name.length > 3 ? data.full_name.slice(0, 3) : data.full_name.slice(data.full_name.length);
                name = name.toUpperCase();
                myRefferCode = `${name}${randomNumber}`;
                data['my_reffer_code'] = myRefferCode;
            }
            const res = await userSchema.create(data);
            return res;
        }
    } catch(error) {
        console.error(error)
        return {
            status: 400,
            message: error
        }
    }
}

module.exports = { createUser };