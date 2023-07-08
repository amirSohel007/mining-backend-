const userSchema = require('./user.model');
const subscriptionTransactionSchema = require('../subscription/transaction/subscription.transaction.model');
const incomeTransactionSchema = require('../income/transaction/incometransaction.model');
const userIncomeSchema = require('../income/income.model');
const { IncomeType, getHours, Status, UserFundStatus } = require('../../commonHelper');
const { creditIncome } = require('../income/income.service');
const moment = require('moment');

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
        const result = await userSchema.find({ _id: user_id }, { token: 0, password: 0 }).lean().exec();
        const totalDailyIncome = (await subscriptionTransactionSchema.find({ 
            user: user_id, 
            $or: [
                { income_type: IncomeType.DAILY },
                { income_type: IncomeType.ALL_PLAN_PURCHASE_REWARD },
                { income_type: IncomeType.DOWN_TEAM_PLAN_PURCHASE_REWARD }
            ]
        }).lean().exec()).reduce((acc, curr) => acc + curr.amount, 0.0);
        // need to add daily direct also into query
        const directIncome = (await subscriptionTransactionSchema.find({ 
            user: user_id,
            $or: [
                { income_type: IncomeType.INSTANT_DIRECT },
                { income_type: IncomeType.DAILY_DIRECT }
            ]            
        }).lean().exec()).reduce((acc, curr) => acc + curr.amount, 0.0);
        const withdrawal = (await incomeTransactionSchema.find({ user_id, status: UserFundStatus.ACCEPT }).lean().exec()).reduce((acc, curr) => acc + curr.amount, 0.0);
        const userIncome = await userIncomeSchema.findOne({ user_id }, 'balance');
        if (result && result.length) {
            let user = result[0];
            user['direct_user_count'] = user.downline_team.length;
            user['down_user_count'] = getTeamMemberCount(user.downline_team, 0);
            user['total_daily_income'] = totalDailyIncome;
            user['reward_time_end'] = getHours(user.created_at, moment());
            user['direct_income'] = directIncome;
            user['total_withdrawal'] = withdrawal;
            user['total_income'] = userIncome ? userIncome.balance : 0;
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
        let user = await userSchema.findOne({ _id: user_id }, '-_id full_name my_reffer_code sponser_id joining_date status')
        .populate({ 
            path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                    path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                        path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                            path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_codesponser_id joining_date status', populate: {
                                path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                                    path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status'
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
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getUserAndDirectTeam (user_id, team_type) {
    try {
        let user = await userSchema.findOne({ _id: user_id }, '-_id full_name my_reffer_code sponser_id joining_date status')
        .populate({ 
            path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status downline_team' 
        }).lean().exec();

        if (user) {
            const team = user.downline_team.map(user => {
                user['level'] = 1;
                return user;
            });
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
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

function getLevel (arr, level = 1, team) {
    if (arr && arr.length > 0) {
        if (arr[0] && arr[0].level) {
            level = arr[0].level;
        }
        for (let i = 0; i < arr.length; i++) {
            arr[i].level = level;
        }
        for (let i = 0; i < arr.length; i++) {
            let currentLevel = level;
            getLevel(arr[i].downline_team, currentLevel + 1);
        }
    }
    return arr;
}

function convertNestedArrayToLinearArray (arr = [], linearArray = []) {
    for (let i = 0; i < arr.length; i++) {
        linearArray.push({
            full_name: arr[i].full_name,
            my_reffer_code: arr[i].my_reffer_code,
            sponser_id: arr[i].sponser_id,
            level: arr[i].level,
            is_level_unlocked: arr[i].is_level_unlocked,
            joining_date: arr[i].joining_date, 
            status: arr[i].status ? arr[i].status : 'INACTIVE'
        });
        convertNestedArrayToLinearArray(arr[i].downline_team, linearArray);
    }
    return linearArray;
}

function getTeamMemberCount (arr, count = 0) {
    if (arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
            count += arr.length;
            return getTeamMemberCount(arr[i].downline_team, count);
        }
    }
    return count;
}

async function levelIncome () {
    try {
        // get all users who have two or more then two direct users
        const users = await userSchema.find({ direct_team_size: { $gte: 2 } });
        console.log('LEVEL_INCOME : ', users);

        for (let i = 0; i < users.length; i++) {
            const user = await getUserAndDownTeam(users[i]._id);
            const team = getDownTeamLevelForIncome(user.downline_team, 1);
            const convertedArray = convertNestedArrayToLinearArray(team); 
            const sortedArray = await filterLevelForIncome(users[i]._id, convertedArray);
            console.log('USER : ', user);
            console.log('TEAM : ', team);
            console.log('CONVERTED : ', convertedArray);
            console.log('SORTED_DATA : ', sortedArray);
        }
    } catch (error) {
        console.log('LEVEL_INCOME_ERROR : ', error);
        return 0;
    }
}

async function getUserAndDownTeam (userId) {
    try {
        let user = await userSchema.findOne({ _id: userId }, '-_id full_name my_reffer_code sponser_id joining_date status')
        .populate({ 
            path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                    path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                        path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                            path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_codesponser_id joining_date status', populate: {
                                path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status', populate: {
                                    path: 'downline_team', model: 'user', select: '-_id full_name my_reffer_code sponser_id joining_date status'
                                }
                            }
                        }
                    }
                }
            } 
        }).lean().exec();
        return user;
    } catch (error) {
        console.log('GET_USER_AND_DOWN_TEAM_ERROR : ', error);
        return null;
    }
}

function getDownTeamLevelForIncome (arr, level = 1, levelUnlocked) {
    if (arr && arr.length > 0) {
        if (arr[0] && arr[0].level) {
            level = arr[0].level;
            levelUnlocked = arr[0].is_level_unlocked
        }
        for (let i = 0; i < arr.length; i++) {
            arr[i].level = level;
            arr[i].is_level_unlocked = arr.length >= 2 ? true : false; 
        }
        for (let i = 0; i < arr.length; i++) {
            let currentLevel = level;
            getDownTeamLevelForIncome(arr[i].downline_team, currentLevel + 1, levelUnlocked);
        }
    }
    return arr;
}

async function filterLevelForIncome (userId, arr = []) {
    if (arr.length) {

        const sortedData = arr.sort((a, b) => {
            const level_a = a.level;
            const level_b = b.level;
            if (level_a > level_b) {
                return 1;
            } else {
                return -1;
            }
        });

        const levels = [{ level: 1, income: 5 }, { level: 2, income: 4 }, { level: 3, income: 4 }, { level: 4, income: 3 }, { level: 5, income: 3 }, { level: 6, income: 2 }, { level: 7, income: 1 }];

        for (let i = 0; i < levels.length; i++) {
            const isLevelUnlocked = arr.find(obj => obj.level == levels[i].level && obj.is_level_unlocked == true);
            console.log('LEVEL : ', i, 'LEVEL_1 : ', levels[i]);
            if (isLevelUnlocked) {
                for (let j = 0; j < arr.length; j++) {
                    await creditIncome(userId, null, levels[i].income, IncomeType.LEVEL_INCOME[i]);
                }
            }
        }
        return sortedData;
    }
}

module.exports = { 
    getUserDetailsWithPopulatedData,
    updateUserDetails,
    getUserInfo,
    getUserAndDownlineTeam,
    getUser,
    getUserAndDirectTeam,
    levelIncome
};