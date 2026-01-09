import express from "express";
import authUser from "../middlewares/authUser.js";
import { triageUser } from "../controllers/triageController.js";

const triageRouter = express.Router();

/**
 * POST /api/triage/analyze
 * Body: { symptoms: string }
 * Header: { token }
 */
triageRouter.post("/analyze", authUser, triageUser);

export default triageRouter;
