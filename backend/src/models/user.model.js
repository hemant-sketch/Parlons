import {Schema} from 'mongoose';
import mongoose from 'mongoose';

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // token we will use for login wagera
    // locally apan sirf token rakhenge baaki sabhi cheeze fetch krke niaklenge
    token: {
        type: String
    }
})

const User = mongoose.model("User", userSchema);


// isko named export kehte hai
export {User};