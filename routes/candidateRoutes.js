const express = require('express');
const router = express.Router();
const User = require('./../models/user');

// import jwt functions
const {jwtAuthMiddleware, generateToken} = require('../jwt');
//import candidate schema model
const Candidate = require('../models/candidate');

// function to check admin role
const checkAdminRole = async (userID) =>{
    try {
        const user = await User.findById(userID);

        if(user.role === 'admin')
            return true;

    } catch (error) {
        return false;
    }
}


//POST route to add a candidate
router.post('/', jwtAuthMiddleware, async(req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
        return res.status(403).json({ message: 'user has not admin role' });
    
    const data = req.body;
    //create a new User document using mongoose model
    const newCandidate = new Candidate(data);

    //save the new User to the database
    const response = await newCandidate.save();
    console.log('data saved');
    
    res.status(200).json({response: response});
    
  } catch (err) {
    console.log(err);
    res.status(500).json({error: 'internal server error'});
    
  }
});

// update method
router.put('/:candidateId',jwtAuthMiddleware, async (req, res) =>{
    try {

        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user has not admin role'});

        const candidateId = req.params.candidateId; //extract the id from url parameter
        const candidateUpdatedData = req.body;  //updated data for the person
        const response = await Candidate.findByIdAndUpdate(candidateId, candidateUpdatedData, {
            new: true,  //return the updated document
            runValidators: true     //run mongoose validation
        });

        if(!response){
            res.status(403).json({error: 'Candidate not found'});
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
        
      
        

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'internal server error'});
    }
    



});
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) =>{
    try {

        if(!checkAdminRole(req.user.id))
        return res.status(403).json({message: 'user has not admin role'});

        const candidateId = req.params.candidateId; //extract the id from url parameter
        const response = await Candidate.findByIdAndDelete(candidateId);

        if(!response){
            res.status(403).json({error: 'Candidate not found'});
        }

        console.log('Candidate data deleted');
        res.status(200).json(response);
        
      
        

    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'internal server error'});
    }
    



});

// route for voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) =>{
    // no admin can vote
    // user can only vote once
    candidateId = req.params.candidateId;
    userId = req.user.id;

    try {
        // find the candidate document with the specified candidateId
        const candidate = await Candidate.findById(candidateId);
        if(!candidate)
            return res.status(404).json({message: 'candidate not found'});

        // find the user with userid
        const user = await User.findById(userId);
        if(!user)
            return res.status(404).json({message: 'user not found'});

        // if user already voted
        if(user.isvoted)
            return res.status(400).json({message: 'you have already vote'});

        // if user has admin role
        if(user.role == 'admin')
            return res.status(403).json({message: 'admin not allowed to vote'});

        // update the candidate document to record the vote
        candidate.votes.push({user: userId});
        candidate.voteCount++;
        await candidate.save();

        // update the candidate document
        user.isvoted = true;
        await user.save();

        res.status(200).json({message: 'user vote successfully'});


    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'internal server error'});
    }
});

// route for vote count
router.get('/vote/count', async (req, res) =>{
    try {
        // find all candidate and sort them by votecount in descending order
        const candidate = await Candidate.find().sort({votecount: 'desc'});

        // map the candidates to only return their name and votecount
        const voteRecord = candidate.map((data) =>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });
        res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({error: 'internal server error'});
    }
})


module.exports = router;