const mongoose = require('mongoose');
const { UserRole } = require('../../../commonHelper');

// define a schema
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.Schema.Types;

// define QR schema
const QRCodeSchema = new Schema({
    qr:{ type: String },
    created_at: { type: Date, require: true, default: Date.now() },
    updated_at: { type: Date, require: true, default: Date.now() },
    created_by: { type: Schema.Types.ObjectId, require: true, ref: 'AdminUser' },
    updated_by: { type: Schema.Types.ObjectId, require: true, ref: 'AdminUser' }
});

const qrCodeSchema = mongoose.model('qr_code', QRCodeSchema);
module.exports = qrCodeSchema;