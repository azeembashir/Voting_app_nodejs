const express = require('express');
const router = express.Router();

// import jwt functions
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

//import user schema model
const User = require('./../models/user');

//  post route for signup and make one person admin 
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    // Check if trying to create another admin
    if (data.role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already exists. Only one admin is allowed.' });
      }
    }

    // Create new user
    const newUser = new User(data);
    const response = await newUser.save();
    console.log('User data saved');

    const payload = {
      id: response.id
    };
    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log("Token is : ", token);

    res.status(200).json({ response: response, token: token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// login route
router.post('/login', async (req, res) =>{
  try {
    // extract username and password from request body
    const {nicNumber, password} = req.body;

    // find the user by nicNumber
    const user = await User.findOne({nicNumber: nicNumber});
    // if user does not exist or password does not match, return error
    if( !user || !(await user.comparePassword(password))){
      res.status(401).json({error: 'invalid username or password'})
    }
    // generate token
    const payload = {
      id: user.id
    }
    const token = generateToken(payload);
    // return token as response
    res.json({token});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'internal server error'});
  }
});

// profile route
router.get('/profile', async (req, res) =>{
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await Person.findById(userId);
    res.status(200).json({user});

    
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'internal server error'});
  }
});



// update method
router.put('/profile/password', jwtAuthMiddleware, async (req, res) =>{
    try {

        const userId = req.user.id; //extract the id from token

        const {currentPassword, newPassword} = req.body;    //extract the current and newpassword from req.body
        // find the user by userId
        const user = await User.findById(userId);

        // if password does not match, return error
        if(!(await user.comparePassword(currentPassword))){   
        res.status(401).json({error: 'invalid username or password'})
        }

        // update the user password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: 'Password updated'});
        
      
        

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'internal server error'});
    }
    



});

module.exports = router;