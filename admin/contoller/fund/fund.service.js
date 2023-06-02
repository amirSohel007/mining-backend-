const fundTransactionSchema = require('../../../controller/fund/transaction/fundtransaction.model');


const changeFundStatus = (user_id,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const transaction = await fundTransactionSchema.findOneAndUpdate({ _id: user_id },{status : status});
            console.log(transaction);
            if(transaction){
                resolve({ message: 'status updated'})
            }else{
                reject({ message: 'user not found'})
            }
        }catch(error){
            reject({
                status: error.status || 500,
                message: error
            })
        }
    })
}

module.exports = { changeFundStatus };