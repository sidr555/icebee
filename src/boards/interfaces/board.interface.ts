import { Document } from 'mongoose';

export interface Board extends Document {
    readonly type: string;
    readonly worker: string;
    readonly portnum: number;
    readonly description: string;
    readonly state: string;
}