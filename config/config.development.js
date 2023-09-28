module.exports = {
  db: {
    mongo:
      "mongodb+srv://admin:admin@cluster0.q9jsz.mongodb.net/?retryWrites=true&w=majority/mining",
  },
  allowedOrigins: ["*"],
  jwtSecretKey: "ITo7zN@7WBD7QmLprJudmE#4!M6*NI",
  jwtExpiresIn: "180d",
  s3Bucket: {
    bucket_name: 'mining-project',
    access_key: 'AKIAYMTDEK7Y5NDVRF7N',
    secret_access_key: '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',
    signature_version: 'AWS4-HMAC-SHA256',
    region: 'us-east-2',
  },
  useS3: false
};
