const userSchema = require('../../user/user.model');
const userSubscriptionSchema = require('../user_subscription/usersubscription.model');
const boostIncomeSchema = require('../../../admin/contoller/boost_income/boost_income.model');
const { creditIncome } = require('../../income/income.service');
const { Status, getHours, IncomeType } = require('../../../commonHelper');
const moment = require('moment');

async function calculateBoostingIncome () {
    try {
        // get all users with their direct team
        const users = await userSchema.find({ status: Status.ACTIVE });
        const boostingIncomeDetails = await boostIncomeSchema.find({});

        if (boostingIncomeDetails && boostingIncomeDetails.length === 0) {
            console.log('BOOSTING_INCOME_DETAILS_ARE_MISSING');
            return 0;
        }

        //  set the variables for booting income details 
        const firstLevelTeamCount = boostingIncomeDetails.length ? boostingIncomeDetails[0].direct_team_count : 0;
        const firstLevelDurationHours = boostingIncomeDetails.length ? boostingIncomeDetails[0].duration_hours : 0;
        const firstLevelIncomePercentage = boostingIncomeDetails.length ? boostingIncomeDetails[0].extra_income_percentage : 0;
        const secondLevelTeamCount = boostingIncomeDetails.length > 1 ? boostingIncomeDetails[1].direct_team_count : 0;
        const secondLevelDurationHours = boostingIncomeDetails.length > 1 ? boostingIncomeDetails[1].duration_hours : 0;
        const secondLevelIncomePercentage = boostingIncomeDetails.length > 1 ? boostingIncomeDetails[1].extra_income_percentage : 0;
        const thirdLevelTeamCount = boostingIncomeDetails.length > 2 ? boostingIncomeDetails[2].direct_team_count : 0;
        const thirdLevelDurationHours = boostingIncomeDetails.length > 2 ? boostingIncomeDetails[2].duration_hours : 0;
        const thirdLevelIncomePercentage = boostingIncomeDetails.length > 2 ? boostingIncomeDetails[2].extra_income_percentage : 0;
        

        for (let i = 0; i < users.length; i++) {

            const elapsedHours = getHours(moment(users[i].created_at, 'h:mm:ss a'),  moment(moment(), 'h:mm:ss a'));
            const allowedHours = boostingIncomeDetails[boostingIncomeDetails.length - 1].duration_hours;
            console.log('HOURS : ', elapsedHours, 'MAX_ALLOWED_HOURS', allowedHours);

            // check if user is in allowed time limit
            if (users[i].is_eligibale_for_extra_income || (elapsedHours <= allowedHours)) {

                // check if this user has count of direct users as defined in the db
                if (users[i].downline_team && users[i].downline_team.length >= firstLevelTeamCount) {
                    let countOfSamePackageTeamMember = 0;
                
                    // get particular users subscriptions
                    const subscriptions = await getUserSubscriptions(users[i]._id.toString());
                    console.log('USER_PLAN : ', subscriptions);
                    const selfTotalInvestments = subscriptions.reduce((acc, current) => acc += parseInt(current.plan.price), 0.0);
                    console.log('SELF_TOTAL_INVESTMENTS : ', selfTotalInvestments);
                
                    for (let j = 0; j < users[i].downline_team.length; j++) {
                        const directUser = users[i].downline_team[j];
                        // get direct users subscriptions
                        const directTeamSubscriptionPlans = await userSubscriptionSchema.find({ user: directUser._id })
                        .populate({ path: 'plan', model: 'subscription_plan' })
                        .populate({ path: 'user', model: 'user' });

                        console.log('DIRECT_USER_PLAN : ', directTeamSubscriptionPlans);
                        const totalInvestments = directTeamSubscriptionPlans.reduce((acc, current) => acc += parseInt(current.plan.price), 0.0);
                        console.log('TOTAL_INVESTMENTS : ', totalInvestments);

                        // if direct user has same or greater subscription then increase counter
                        if (totalInvestments >= selfTotalInvestments) {
                            countOfSamePackageTeamMember++;
                        }
                    }
                    
                    if (
                        (users[i].is_eligibale_for_extra_income === false && thirdLevelDurationHours <= elapsedHours) || 
                        (thirdLevelTeamCount && countOfSamePackageTeamMember >= thirdLevelTeamCount)
                    ) {
                        console.log('TOTAL_USER_LEVEL_3 : ', countOfSamePackageTeamMember);
                        // credit 10% extra of all user subscribed plan
                        const result = await creditExtraIncomeOnAllUserPlan(users[i]._id, subscriptions, thirdLevelIncomePercentage, IncomeType.BOOSTING_LEVEL_3);
                        users[i].is_eligibale_for_extra_income = true;
                    } else if (
                        (users[i].is_eligibale_for_extra_income === false && secondLevelDurationHours <= elapsedHours) || 
                        ((secondLevelTeamCount && countOfSamePackageTeamMember >= secondLevelTeamCount) && (thirdLevelTeamCount && countOfSamePackageTeamMember < thirdLevelTeamCount))
                    ) {
                        console.log('TOTAL_USER_LEVEL_2 : ', countOfSamePackageTeamMember);
                        // credit 15% extra of all user subscribed plan
                        const result = await creditExtraIncomeOnAllUserPlan(users[i]._id, subscriptions, secondLevelIncomePercentage, IncomeType.BOOSTING_LEVEL_2);
                        users[i].is_eligibale_for_extra_income = true;
                    } else if (
                        (users[i].is_eligibale_for_extra_income === false && firstLevelDurationHours <= elapsedHours) || 
                        ((firstLevelTeamCount && countOfSamePackageTeamMember >= firstLevelTeamCount) && (secondLevelTeamCount && countOfSamePackageTeamMember < secondLevelTeamCount))
                    ) {
                        console.log('TOTAL_USER_LEVEL_1 : ', countOfSamePackageTeamMember);
                        // credit 20% extra of all user subscribed plan
                        const result = await creditExtraIncomeOnAllUserPlan(users[i]._id, subscriptions, firstLevelIncomePercentage, IncomeType.BOOSTING_LEVEL_1);
                        users[i].is_eligibale_for_extra_income = true;
                    }
                    await users[i].save();
                }
            }
        }
        return 1;
    } catch (error) {
        console.log('CALCULATE_BOOSTING_INCOME_ERROR : ', error);
        return 0;
    }
}

async function getUserSubscriptions (userId) {
    try {
        const selfSubscriptionPlans = await userSubscriptionSchema.find({ user: userId })
        .populate({ path: 'plan', model: 'subscription_plan' });
        return selfSubscriptionPlans;
    } catch (error) {
        console.log('CALCULATE_BOOSTING_INCOME_ERROR : ', error);
        return null;
    }
}

async function creditExtraIncomeOnAllUserPlan (userId, subscriptions = [], incomePercent = 0, typeOfIncome) {
    try {
        if (incomePercent === 0) {
            console.log('INCORRECT_INCOME_PERCENTAGE : ', incomePercent);
        }
        for (let i = 0; i < subscriptions.length; i++) {
            const elapsedHours = getHours(moment(subscriptions[i].next_daily_income, 'h:mm:ss a'), moment(moment(), 'h:mm:ss a'));
            if (elapsedHours > 24) {
                const amount = subscriptions[i].plan.daily_income * incomePercent / 100;
                creditIncome(userId, subscriptions[i]._id, amount, typeOfIncome);
            }
        }
        return 1;
    } catch (error) {
        console.log('CALCULATE_BOOSTING_INCOME_ERROR : ', error);
        return null;
    }
}

module.exports = { calculateBoostingIncome }