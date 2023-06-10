module.exports = {
    db: {
        mongo: 'mongodb://127.0.0.1/mining'
    },
    allowedOrigins: ['*'],
    jwtSecretKey: 'ITo7zN@7WBD7QmLprJudmE#4!M6*NI',
    jwtExpiresIn: '8h',
    s3Bucket: {
        bucket_name: 'mining-project',
        access_key: 'AKIAYMTDEK7Y5NDVRF7N',
        secret_access_key: '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',
        signature_version: 's3v4',
        region: 'us-east-2',
    }
}
