import mongoose from "mongoose";


const userschema= new mongoose.Schema(
   {
    username:{
        type:String,
        required:[true,"username is required"],
        unique:[true,"username should be unnique"]
    },
    emailID:{
        type:String,
        required:[true,"email id is required"],
        unique:[true,"email should be unnique"]

    },
    password:{
        type:String,
         required:[true,"password is required"],
    }
   }

)
   const usermodel=mongoose.model("users",userschema)
   export default usermodel