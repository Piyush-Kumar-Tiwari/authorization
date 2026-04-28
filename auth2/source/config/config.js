import dotenv from "dotenv";

dotenv.config() //without calling dotenv.config you cannot use any caribles from dotenv

//for accesing all variables in .env file we use a package name  as dotenv
if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined")
}
if(!process.env.JWT_SECRET){
    throw new Error("jwt secret is not defined in environmental variables ")
}
 const config={
    MONGO_URI:process.env.MONGO_URI,
    JWT_SECRET:process.env.JWT_SECRET

}
export default config