import mongoose from "mongoose";

const SessionSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:[true,"user is required"]
    },
    refreshToken:{
        type:String,
        required:[true,"hashed refresh token is required"]

    },
    ip:{
        type:String,
        required:[true,"ip is required"]
    },
    userAgent:{
             type:String,
             required:[true,"User Agent is required"]
    },
    revoked:{
        type:Boolean,
        default:false
    },
    
},
{
    timestamps:true
}
)

 const sessionModel=mongoose.model("session",SessionSchema)
 export default sessionModel