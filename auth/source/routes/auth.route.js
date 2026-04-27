import { Router} from "express";
import * as authcontroller from '../controllers/auth.controller.js'
const authRouter=Router()


authRouter.post("/register",authcontroller.register)
authRouter.post("/login",authcontroller.login)
authRouter.get("/get-me",authcontroller.getMe)

authRouter.get("/refreshToken",authcontroller.refreshToken)

authRouter.get("/logout",authcontroller.logout)

authRouter.get("/logout-all",authcontroller.logoutAll)
export default authRouter
