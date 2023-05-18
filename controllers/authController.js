import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req,res) => {
    try{
        const {name, email, password, answer} = req.body;
        //backend validation..we will do the same in client side as well
        if(!name)
            return res.send({message:'Name is Required'})
        if(!email)
            return res.send({message:'Email is Required'})
        if(!password)
            return res.send({message:'Password is Required'})
        if(!answer)
            return res.send({message:'Answer is Required'})

        //existing user 
        const existingUser = await userModel.findOne({email})  
        if(existingUser){
            return res.status(200).send({
                success:false,
                message:'Already Registered, Please Login'
            })
        }

        //register new user now
        const hashedPassword = await hashPassword(password);
        //save
        const user = await userModel.create({name,email,password:hashedPassword,answer});
            
        res.status(201).send({
            success:true,
            message:'User Registered Successfully',
            user
        })
    } 
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:'Error in Registration',
            error
        })
    }
};

// POST LOGIN
export const loginController = async (req, res) => {
    try{
        const {email, password} = req.body;
        //validation
        if(!email || !password)
            return res.status(404).send({
                success:false,
                message: "Invalid email or password"
            })
        //check user
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(404).send({
                success: false,
                message: "Email is not registered"
            })
        }
        const match = await comparePassword(password, user.password) 
        if(!match)
            return res.status(200).send({
                success: false,
                message: "Invalid password"
            }) 
            
        //create token
        const token = await JWT.sign({_id:user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        res.status(200).send({
            success: true,
            message: "Login successful",
            user: {
                name: user.name,
                email:user.email,
                role: user.role
            },
            token
        });    

    }catch(err){  
        console.log(err);
        res.status(500).send({
            success:false,
            message:"Error in Logging in",
            err
        });
     }


};

//forgotPasswordController
export const forgotPasswordController = async (req, res) => {
    try{
        const {email, answer, newPassword} = req.body;
        if(!email){
            res.status(400).send({message: "Email is required"})
        }
        if(!answer){
            res.status(400).send({message: "Answer is required"})
        }
        if(!newPassword){
            res.status(400).send({message: "New Password is required"})
        }
        //check
        const user = await userModel.findOne({email,answer})
        //validation
        if(!user){
            res.status(404).send({
                success:false,
                message: "wrong email or answer",
            });
        }
        const hashed = await hashPassword(newPassword);
        await userModel.findByIdAndUpdate(user._id, {password:hashed});
        res.status(200).send({
            success:true,
            message:"Password reset successfully",
        })

    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message:"something went wrong",
            error 
        })
    }
};

//test controller
export const testController = (req, res) => {
    try{
        res.send("Protected route");
    }catch(error){
        console.log(error);
        res.send({error});
    }
}

