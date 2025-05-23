import express from "express";
import Governor from "../models/governor.model.js";
import e from "express";
import {
    getGovernors,
    createGovernor,
    deleteGovernor,
    getGovernor,
    updateGovernor,
    changeGovernorPassword,
} from "../controllers/governor.controller.js";
import { isAuthenticated } from "../routers.middleware/authentication.js";

const governorRouter = express.Router();

governorRouter.post("/createGovernor", createGovernor);

governorRouter.get("/getGovernors", getGovernors);

governorRouter.get("/getGovernor", isAuthenticated, getGovernor);

governorRouter.delete("/deleteGovernor", isAuthenticated, deleteGovernor);

governorRouter.put("/updateGovernor", isAuthenticated, updateGovernor);

governorRouter.put("/changeGovernorPassword", isAuthenticated, changeGovernorPassword);

export default governorRouter;
