import * as mongoose from 'mongoose';

export const BoardSchema = new mongoose.Schema({
    type: String,
    worker: String,
    portnum: Number,
    description: String,
    state: String
});