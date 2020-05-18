/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';

mongoose.Promise = require('bluebird');

var BlockSchema = new Schema({
    username: String,
    profile: {}
}, { timestamps: true });

export default mongoose.model('Block', BlockSchema);
