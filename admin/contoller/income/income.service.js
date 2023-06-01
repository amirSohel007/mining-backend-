const incomeTransactionSchema = require('../../../controller/income/income.module');


const changeIncomeStatus = (user_id,status) =>{
    return new Promise(async (resolve,reject) => {
        try{
            const incomeTransaction = await incomeTransactionSchema.findOneAndUpdate({ _id: user_id },{status : status});
            console.log(incomeTransaction);
            if(incomeTransaction){
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

module.exports = { changeIncomeStatus };