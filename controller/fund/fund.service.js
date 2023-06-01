const userFundSchema = require('./userfund/userfund.model');
const fundTransactionSchema = require('./transaction/fundtransaction.model');
const { getUserInfo } = require('../user/user.service');
const {UserFundStatus} = require('../../commonHelper');

async function addFund (user_id, data, transaction_type) {
    try {
        let userFund = await userFundSchema.findOne({ user_id });
        if (userFund == null) {
            userFund = await userFundSchema.create({
                user_id: user_id,
                fund_balance: 0.0,
                fund_transaction: []
            });
        }
        // create transaction history
        let transaction = await fundTransactionSchema.create({
            user_id: user_id,
            amount: data.amount,
            transaction_no: data.transaction_no,
            receipt: data.receipt_path,
            transaction_type: transaction_type,
            received_from: data.received_from,
            status: UserFundStatus.PENDING,
            user_fund: userFund._id
        });
        userFund.fund_balance += transaction.amount;
        userFund.fund_transaction.push(transaction._id);
        userFund.save();
        return userFund;
    } catch(error) {
        console.error('ADD_FUND_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getUserFund (user_id) {
    try {
        let userFund = await userFundSchema.findOne({ user_id })
        .populate({ path: 'fund_transaction' });
        if (userFund) {
            return userFund;
        }
        return { message: 'record not found'};
    } catch (error) {
        console.error('GET_BANK_DETAIL_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getUserFundTransaction (user_id, fund_request_type) {
    try {
        let query = { user_id };
        if (fund_request_type) {
            query['transaction_type'] = fund_request_type;
        }
        console.log('FUND_TRANSACTION : ', query);
        let transaction = await fundTransactionSchema.find(query);
        if (transaction) {
            return transaction;
        }
        return { message: 'record not found'};
    } catch (error) {
        console.error('GET_USER_FUND_TRANSACTION_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function sendFund (user_id, to_user_id, amount) {
    try {
        // check sender has fund or not
        let fromUserFund = await userFundSchema.findOne({ user_id });
        // check requested amount is available or not
        if (fromUserFund && fromUserFund.fund_balance && fromUserFund.fund_balance >= amount) {
            
            // add fund to receiver account
            let transfer = await addFund(to_user_id, { amount, received_from: user_id }, 'FUND_RECEIVED');
            if (transfer) {

                // create transaction history
                let transaction = await fundTransactionSchema.create({
                    user_id: user_id,
                    amount: amount,
                    transaction_type: 'FUND_SENT',
                    sent_to: to_user_id,
                    status: UserFundStatus.PENDING,
                    user_fund: fromUserFund._id
                });

                // update sender account
                fromUserFund.fund_balance -= amount;
                fromUserFund.fund_transaction.push(transaction._id);
                fromUserFund.save();
                return fromUserFund;
            }
            throw {
                status: 500,
                message: 'error in transferring balance to receiver'
            }
        }
        throw {
            status: 400,
            message: 'insufficient fund'
        }
    } catch (error) {
        console.error('SEND_FUND_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

module.exports = { addFund, getUserFund, getUserFundTransaction, sendFund };