const schedularSchema = require('./schedular.model');
const moment = require('moment');

async function logSchedularActivity () {
    try {
        let schedular = await schedularSchema.findOne({});
        let run = false;
        if (schedular) {
            if (schedular.last_executed === moment().utcOffset("+05:30").format('d/mm/yyyy')) {
                schedular.is_executed_today = true;
                run = false;
            } else {
                schedular.is_executed_today = false;
            }

            if (schedular.is_executed_today === false) {
                schedular.counter += 1;
                schedular.last_executed = moment().utcOffset("+05:30").format('d/mm/yyyy');
                is_executed_today = true;
                run = true;
            }
            await schedular.save();
            return run;
        } else {
            schedular = await schedularSchema.create({
                counter: 1,
                last_executed: moment().utcOffset("+05:30").format('d/mm/yyyy'),
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

module.exports = { logSchedularActivity }