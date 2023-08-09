const boostIncomeSchema = require('./boost_income.model');
const moment = require('moment');

async function addBoostIncomeDetails (userId, boostIncomeId, data) {
    try {
        let boostIncomeDetails = await boostIncomeSchema.findOne({ _id: boostIncomeId });
        if (boostIncomeDetails) {
            boostIncomeDetails.duration_hours = data.duration_hours;
            boostIncomeDetails.direct_team_count = data.direct_team_count;
            boostIncomeDetails.extra_income_percentage = data.extra_income_percentage;
            // boostIncomeDetails.updated_at = moment();
            boostIncomeDetails.updated_by = userId;
            await boostIncomeDetails.save();
        } else {
            boostIncomeDetails = await boostIncomeSchema.create(data);
        }
        return boostIncomeDetails;
    } catch (error) {
        conaole.log('BOOST_INCOME_ADD_OR_UPDATE_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        }
    }
}

async function getAllBootIncomeDetails (query = {}) {
    try {
        const bootIncome = await boostIncomeSchema.find(query);
        return bootIncome;
    } catch (error) {
        conaole.log('GET_BOOST_INCOME_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        } 
    }
}

module.exports = { addBoostIncomeDetails, getAllBootIncomeDetails }