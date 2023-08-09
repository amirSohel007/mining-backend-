const userFundSchema = require('./userfund/userfund.model');
const fundTransactionSchema = require('./transaction/fundtransaction.model');
const { getUserInfo } = require('../user/user.service');
const { upload_file_to_s3, get_s3_file } = require('../../s3_confif');
const { FundTransactionType, getBaseUrl, UserFundStatus } = require('../../commonHelper');
const config = require('../../config').config();
const moment = require('moment-timezone');

async function addFund (user_id, data, transaction_type, imageData) {
    try {
        let fundTransactionData;
        if (data && data.transaction_no) {
            fundTransactionData = await fundTransactionSchema.find({ transaction_no: data.transaction_no });
            if (fundTransactionData && fundTransactionData.length) {
                throw {
                    status: 400,
                    message: 'Transaction number already exist'
                }
            }
        }

        let userFund = await userFundSchema.findOne({ user_id });
        if (userFund == null) {
            userFund = await userFundSchema.create({
                user_id: user_id,
                fund_balance: 0.0,
                fund_transaction: []
            });
        }

        let s3_file = imageData;
        if (transaction_type === FundTransactionType.ADD) {
            if (config.useS3) {
                s3_file = await upload_file_to_s3(imageData);
                console.log('S3_FILE_DATA : ', s3_file);
            }
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
            user_fund: userFund._id,
            fund_receipt : s3_file && s3_file.key ? s3_file.key : s3_file
        });
        if (FundTransactionType.RECEIVE === transaction_type) {
            userFund.fund_balance += transaction.amount;
        }
        userFund.fund_transaction.push(transaction._id);
        // userFund.updated_at = new moment().utc();
        await userFund.save();
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
        let userFund = await userFundSchema.findOne({ user_id }, '-_id')
        .populate({ path: 'fund_transaction' });
        if (userFund) {
            return userFund;
        }
        return { message: 'Record not found'};
    } catch (error) {
        console.error('GET_BANK_DETAIL_ERROR : ', error);
        throw {
            status: error.status || 500,
            message: error
        };
    }
}

async function getUserFundTransaction (user_id, fund_request_type, req) {
    try {
        let query = { user_id };
        if (fund_request_type) {
            query['transaction_type'] = fund_request_type;
        }
        console.log('FUND_TRANSACTION : ', query);
        
        let transaction;
        if (FundTransactionType.RECEIVE === fund_request_type) {
            transaction = await fundTransactionSchema.find(query, '-_id -user_id')
            .populate({ path: 'received_from', model: 'user', select: '-_id my_reffer_code full_name' })
            .populate({ path: 'user_id', model: 'user', select: '-_id my_reffer_code full_name' }).lean().exec();
        } else {
            transaction = await fundTransactionSchema.find(query, '-_id -user_id')
            .populate({ path: 'sent_to', model: 'user', select: '-_id my_reffer_code full_name' })
            .populate({ path: 'user_id', model: 'user', select: '-_id my_reffer_code full_name' }).lean().exec();
        }

        if (transaction) {
            let result = [];
            if (fund_request_type = FundTransactionType.ADD && transaction.length) {
                for (let i = 0; i < transaction.length; i++) {
                    let obj = { ...transaction[i] };
                    if (config.useS3 && obj.fund_receipt && obj.fund_receipt.indexOf('receipts/') != -1) {
                        obj.fund_receipt = await get_s3_file(obj.fund_receipt);
                        console.log('OBJ : ', obj);
                    }
                    if (obj.fund_receipt) {
                        obj.fund_receipt = `${getBaseUrl(req)}/${obj.fund_receipt}`;
                    }
                    result.push(obj);
                }
            } else {
                result = transaction;
            }
            return result;
        }
        return { message: 'Record not found'};
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
                fromUserFund.fund_balance -= parseFloat(amount);
                fromUserFund.fund_transaction.push(transaction._id);
                await fromUserFund.save();
                return fromUserFund;
            }
            throw {
                status: 500,
                message: 'Error in transferring balance to receiver'
            }
        }
        throw {
            status: 400,
            message: 'Insufficient fund'
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