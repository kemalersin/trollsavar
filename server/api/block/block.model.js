/*eslint no-invalid-this:0*/
import mongoose, { Schema } from 'mongoose';
import random from 'mongoose-simple-random';

mongoose.Promise = require('bluebird');

var BlockSchema = new Schema({
    username: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    isNotFound: {
        type: Boolean,
        default: false
    },
    isSuspended: {
        type: Boolean,
        default: false
    },
    addedBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },    
    deletedBy: {
        type: Schema.ObjectId,
        ref: 'User'
    },      
    profile: {}
}, { timestamps: true });

BlockSchema.plugin(random);

export default mongoose.model('Block', BlockSchema);
