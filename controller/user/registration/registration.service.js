const userSchema = require('../user.model');

async function createUser (data) {
    try {
        const res = await userSchema.create(data);
        return res;
    } catch(error) {
        console.error(error)
        return {
            status: 400,
            message: error
        }
    }
}

module.exports = { createUser };