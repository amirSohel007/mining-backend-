const incomeRewardSchema = require('./income_rewards.model');

async function addOtherIncomeAndReward (user_id, data) {
    try {
        const incomeReward = await incomeRewardSchema.create(data);
        return incomeReward;
    } catch (error) {
        console.log('ADD_OTHER_INCOME_AND_REWARD_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getOtherIncomeAndReward () {
    try {
        const incomeReward = await incomeRewardSchema.find({});
        return incomeReward;
    } catch (error) {
        console.log('GET_OTHER_INCOME_AND_REWARD_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

module.exports = {
    addOtherIncomeAndReward,
    getOtherIncomeAndReward
}