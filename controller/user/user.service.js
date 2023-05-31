const userSchema = require('./user.model');

async function getUserDetailsWithPopulatedData (user_id, table_name) {
    try {
        const res = await userSchema.findOne({ _id: user_id })
        .populate({ path: table_name, strictPopulate: false });
        return res;
    } catch(error) {
        console.log('GET_USER_DETAILS : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function updateUserDetails (query, data) {
    try {
        const res = await userSchema.findOneAndUpdate(query, data, { returnOriginal: false });
        return res;
    } catch(error) {
        console.log('UPDATE_USER_DETAILS : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getUserInfo (user_id) {
    try {
        const result = await userSchema.findOne({ _id: user_id }, { token: 0 });
        if (result) {
            return result;
        }
        return { 
            message: 'record not found'
        }
    } catch(error) {
        console.log('GET_USER_DETAILS : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getUser (query) {
    if (query) {
        try {
            const result = await userSchema.findOne(query, { token: 0, password: 0 });
            if (result) {
                return result;
            }
            return { 
                message: 'record not found'
            }
        } catch(error) {
            console.log('GET_USER_DETAILS : ', error);
            throw {
                status: error.status || 500,
                message: error
            }
        }
    } else {
        return null;
    }
}

async function getUserAndDownlineTeam (user_id) {
    try {
        let user = await userSchema.findOne({ _id: user_id }, '_id full_name my_reffer_code email')
        .populate({ 
            path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                    path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                        path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                            path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                                path: 'downline_team', model: 'user', select: '_id full_name', populate: {
                                    path: 'downline_team', model: 'user'
                                }
                            }
                        }
                    }
                }
            } 
        }).lean().exec();

        if (user) {
            const team = getLevel(user.downline_team, 1);
            console.log('DOWNLINE_TEAM_LEVEL : ', team);
            user.downline_team = team;
            return user;
        } else {
            return { 
                message: 'record not found'
            }
        }
    } catch (error) {
        console.log('GET_USERS_DOWNLINE_TEAM_ERROR : ', error);
    }
}

async function getUserAndDirectTeam (user_id) {
    try {
        let user = await userSchema.findOne({ _id: user_id }, '_id full_name my_reffer_code email')
        .populate({ 
            path: 'downline_team', model: 'user', select: '_id full_name' 
        }).lean().exec();

        if (user) {
            const team = getLevel(user.downline_team, 1);
            console.log('DOWNLINE_TEAM_LEVEL : ', team);
            user.downline_team = team;
            return user;
        } else {
            return { 
                message: 'record not found'
            }
        }
    } catch (error) {
        console.log('GET_USERS_DOWNLINE_TEAM_ERROR : ', error);
    }
}

function getLevel (arr, level = 1) {
    if (arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            arr[i].level = level;
            getLevel(arr[i].downline_team, ++level);
        }
    }
    return arr;
}

module.exports = { 
    getUserDetailsWithPopulatedData,
    updateUserDetails,
    getUserInfo,
    getUserAndDownlineTeam,
    getUser,
    getUserAndDirectTeam
};