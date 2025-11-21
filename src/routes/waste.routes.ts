import { Router } from "express";
import { getWasteEstimation } from "../controllers/waste.controller";

const router = Router();

router.get("/:username", getWasteEstimation); // GET only

export default router;
