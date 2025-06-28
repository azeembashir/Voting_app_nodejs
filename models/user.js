const mongoose = require('mongoose');
// import bcrypt
const bcrypt = require('bcrypt');

// define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String,
        
    },
    address: {
        type: String,
        required: true
    },
    nicNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isvoted: {
        type: Boolean,
        default: false
    }
});


// hash password generator
userSchema.pre('save', async function(next){
    const user = this;
    // hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();
    try {
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashPassword = await bcrypt.hash(user.password, salt);
        // overide the person password into hash password
        user.password = hashPassword;
        next();
        
    } catch (error) {
        return next(error);
    }
});


// compare function declare in auth.js
userSchema.methods.comparePassword = async function(candidatePassword){   //.methods custom method bnane ka tareeka
    try {                                               //candidatePassword=> wo password jab user login k wqt deta he
        // use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        throw error;
    }

};
const User = mongoose.model('User', userSchema);
module.exports = User;