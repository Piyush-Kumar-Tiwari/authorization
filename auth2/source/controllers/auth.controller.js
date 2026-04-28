import usermodel from "../model/user.model.js"
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from "../config/config.js"


import sessionModel from "../model/session.model.js"


export async function register(req,res){
    const {username,emailID,password}=req.body
    const ifAlreadyExist=await usermodel.findOne({
        $or:[
            {username},
           { emailID},
        ]
    })
    if(ifAlreadyExist){
        res.status(409).json({
            message:"username already exist"
        })
    }
  
    const hashedpassword=crypto.createHash('sha256').update(password).digest('hex')
    const user=await usermodel.create({
        username,
        emailID,
        password:hashedpassword
    })

const refreshToken=jwt.sign({
    id:user._id,

},config.JWT_SECRET,
{
    expiresIn:"7d"
})

const refreshTokenHash=crypto.createHash('sha256').update(refreshToken).digest('hex')
const session=await sessionModel.create({
    user:user._id,
     refreshToken:refreshTokenHash,
    ip:req.ip,
    userAgent:req.headers["user-agent"]


})




    const accessToken=jwt.sign({
    id:user._id,
    sessionId:session._id

},
config.JWT_SECRET
,
{
    expiresIn:"15m"
})








res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
    secure:true,
    sameSite:"strict",
    maxAge:7*24*60*60*1000 //7 days
})

res.status(200).json({
    message:"user created succesfully",
    user:{
        username:user.username,
        emailID:user.emailID,

    },
    accessToken
   
})



}

export async function login(req,res) {
    const {emailID,password}=req.body
    const user = await usermodel.findOne({
        emailID,
        
    })
    if(!user){
      return  res.status(401).json({
            message:"Invalid email or password"
        })
    }

    const hashedpassword= crypto.createHash("sha256").update(password).digest("hex")

    const isvalidPassword= hashedpassword===user.password
    if(!isvalidPassword){
        return res.status(401).json({
            message:"Password Invalid"
        })
    }

    //then if password match then generate refresh token 
    const refreshToken=jwt.sign({
       id:user._id
    },config.JWT_SECRET,{
        expiresIn:"7d"
    })

    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex")
    const session=await sessionModel.create({
        user:user._id,
        refreshToken:refreshTokenHash,
        ip:req.ip,
        userAgent:req.headers["user-agent"]

    })

    const accessToken=jwt.sign({
        id:user._id,
        sessionid:session._id
    },config.JWT_SECRET,{
        expiresIn:"10m"
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000

    })
    res.status(200).json({
        message:"login succesfully",
        user:{
           username: user.username,
           emailID:user.emailID,
        },
        accessToken:accessToken
    })
}


export async function getMe(req,res){//for getting the exact user from the server we need to get it from the  exact token , token is present in the header in authorization
    const  token =req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        res.status(409).json({
            message:"token not found"
        })
    }
    const decoded = jwt.verify(token,config.JWT_SECRET)

    const user=await usermodel.findById(decoded.id)
    res.status(200).json({
        message:"user fetched succesfully",
        user:{
        username:user.username,
        emailID:user.emailID,

    },
    })
   
}




export async function refreshToken(req,res){
    const refreshToken=req.cookies.refreshToken
    if(!refreshToken){
        res.status(409).json({
            message:"refresh token not found"
        })}
        const decoded=jwt.verify(refreshToken,config.JWT_SECRET)


       const refreshTokenHash=crypto.createHash('sha256').update(refreshToken).digest('hex')
       

      const session= await sessionModel.findOne({
        refreshTokenHash,
        revoked:false
      })
      
      if(!session){
        res.status(401).json({
            message:"Invalid refresh token"
        })
      }


        const accesToken=jwt.sign({
            id:decoded.id,

        },
    config.JWT_SECRET,
       {
        expiresIn:"15m"
       })

       const newrefreshToken=jwt.sign({
        id:decoded.id

       },
      config.JWT_SECRET,
      {
        expiresIn:"7d"
      }
    
    )

    const newrefreshTokenhash=crypto.createHash('sha256').update(newrefreshToken).digest('hex')


    session.refreshToken=newrefreshTokenhash
    await session.save()

    res.cookie("refreshToken",newrefreshToken,{
        httpOnly:true,
        secure:true,
        sameSite:"strict",
        maxAge:7*24*60*60*1000

    })
       res.status(200).json({
        message:"Refresh Token generated succesfully",
        accesToken
       })
    }




    export async function logout(req, res) {
   const refreshToken = req.cookies.refreshToken

   if (!refreshToken) {
      return res.status(409).json({
         message: "refresh token not found"
      })
   }

   const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex")

   const session = await sessionModel.findOne({
      refreshToken: refreshTokenHash,
      revoked: false
   })

   if (!session) {
      return res.status(409).json({
         message: "invalid refresh token"
      })
   }

   session.revoked = true
   await session.save()

   res.clearCookie("refreshToken")

   res.status(200).json({
      message: "logout successfully"
   })
}



export async function logoutAll(req,res){


    const refreshToken=req.cookies.refreshToken
    if(!refreshToken){
        res.status(400).json(
            {
                message:"refresh Token not found"
            }
        )
    }

    const decoded=jwt.verify(refreshToken,config.JWT_SECRET)
    await sessionModel.updateMany({
          id:decoded.id,
          revoked:false
    },{
        revoked:true
    })

    res.clearCookie(refreshToken)
    res.status(200).json({
        message:"logout from all devices successfully"
    })
}