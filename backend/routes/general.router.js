import express from "express";
const generalRouter = express.Router();
import {
    changePassword,
    createOTPandSendEmail,
    verifyOTP,
    login,
    markNotificationAsRead,
} from "../controllers/general.controller.js";

generalRouter.put("/changePassword", changePassword);
generalRouter.post("/login", login);
generalRouter.post("/createOTP", createOTPandSendEmail);
generalRouter.post("/verifyOTP", verifyOTP);
generalRouter.put("/markNotificationAsRead/:id", markNotificationAsRead);
export default generalRouter;
