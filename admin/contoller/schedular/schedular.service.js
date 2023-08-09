const schedularSchema = require('./schedular.model');
const moment = require('moment-timezone');

async function logSchedularActivity () {
    try {
        let schedular = await schedularSchema.findOne({ last_executed: moment().tz('Asia/Kolkata').format('DD-MM-YYYY') });
        let run = false;
        if (schedular) {
            return run;
        } else {
            schedular = await schedularSchema.create({
                counter: 1,
                last_executed: moment().tz('Asia/Kolkata').format('DD-MM-YYYY'),
                is_executed_today: true,
            });
            run = true;
            return run;
        }
    } catch (error) {
        console.log('LOG_SCHEDULAR_ACTIVITY_ERROR : ', error);
        return false;
    }
}

async function getSchedularTime () {
    try {
        const schedular = await schedularSchema.find({}).sort({ createdAt: -1 });
        if (schedular && schedular.length) {
            return schedular[0];
        }
        return schedular;
    } catch (error) {
        console.log('GET_SCHEDULAR_TIME_ERROR : ', error);
        return [];
    }
}

async function checkSchedulerTrigger () {
    try {
        const today = moment().format('DD-MM-YYYY');

        const schedularRecord = await schedularSchema.findOne({
            execution_date: today
        });

        if (schedularRecord) {

            await schedularSchema.findByIdAndUpdate(schedularRecord._id, {
                $inc: {
                    counter: 1
                }
            });

            return false;

        } else {

            await new schedularSchema({
                counter: 1,
                execution_date: today
            }).save();

            return true;

        }

    } catch {
        console.log('GET_SCHEDULAR_TIME_ERROR : ', error);
        return false;
    }
}

module.exports = { logSchedularActivity, getSchedularTime, checkSchedulerTrigger }