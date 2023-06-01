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
        data['updated_at'] = Date.now();
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
        const user = await userSchema.findOne({ _id: user_id }, { token: 0, password: 0 }).lean().exec();
        // const user = await userSchema.aggregate([
        //     { $match: { "_id": user_id } },
        //     {
        //         $project: {
        //             count: {
        //                 $size: {
        //                     input: "$downline_team"
        //                 }
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             count: { $sum: '$count' }
        //         }
        //     }
        // ]);
        if (user) {
            user['direct_user_count'] = user.downline_team.length;
            user['down_user_count'] = getTeamMemberCount(user.downline_team, 0);
            console.log('USER : ', user);
            return user;
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
            const user = await userSchema.findOne(query, { token: 0, password: 0 });
            if (user) {
                return user;
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
            path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id', populate: {
                path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id', populate: {
                    path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id', populate: {
                        path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id', populate: {
                            path: 'downline_team', model: 'user', select: '_id full_name my_reffer_codesponser_id', populate: {
                                path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id', populate: {
                                    path: 'downline_team', model: 'user', select: '_id full_name my_reffer_code sponser_id'
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
            const linearTeam = convertNestedArrayToLinearArray(team);
            user.downline_team = linearTeam;
            return linearTeam;
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

function convertNestedArrayToLinearArray (arr = [], linearArray = []) {
    for (let i = 0; i < arr.length; i++) {
        linearArray.push({ 
            _id: arr[i]._id,
            full_name: arr[i].full_name,
            my_reffer_code: arr[i].my_reffer_code,
            sponser_id: arr[i].sponser_id,
            level: arr[i].level
        });
        convertNestedArrayToLinearArray(arr[i].downline_team, linearArray);
    }
    return linearArray;
}

function getTeamMemberCount (arr, count = 0) {
    if (arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            count += arr.length;
            getTeamMemberCount(arr[i].downline_team, count);
        }
    }
    return count;
}

module.exports = { 
    getUserDetailsWithPopulatedData,
    updateUserDetails,
    getUserInfo,
    getUserAndDownlineTeam,
    getUser,
    getUserAndDirectTeam
};