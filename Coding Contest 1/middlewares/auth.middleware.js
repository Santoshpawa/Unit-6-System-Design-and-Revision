const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");

async function authmiddleware(req,res,next){
    try {
        let {email,password} = req.body;
        let user = await userModel.findOne({email});
        
        if(!user){
            res.json({msg: "Either email or password is wrong."})   
        
        }
        console.log(hashedPassword);
        const match = await bcrypt.compare(password, hashedPassword);
        if(!match){
            res.json({msg: "Either email or password is wrong."})   
        }else{
            req.user = user._id;
            req.role = user.role;
        }
        next();

    } catch (error) {
        res.json({msg: "Either email or password is wrong."})
        console.log(error);
    }
}

module.exports = authmiddleware;