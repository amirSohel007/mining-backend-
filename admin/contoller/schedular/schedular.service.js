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
        const schedular = await schedularSchema.find({}).sort({ created_at: -1 });
        if (schedular && schedular.length) {
            return schedular[0];
        }
        return schedular;
    } catch (error) {
        console.log('GET_SCHEDULAR_TIME_ERROR : ', error);
        return [];
    }
}

module.exports = { logSchedularActivity, getSchedularTime }