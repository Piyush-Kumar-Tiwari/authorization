import mongoose from "mongoose";
import app from "./source/app.js";
import conectToDB from "./source/config/database.js";
conectToDB()

app.listen(3000,()=>{
    console.log("server is ruuning at port 3000")
})

//EX20HySbrGjYVdA6
//mongodb+srv://learn-auth:EX20HySbrGjYVdA6@auth.wbltlek.mongodb.net/