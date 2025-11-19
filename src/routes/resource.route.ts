import { Router } from "express";
import { getResources } from "../controllers/resource.controller";

const router = Router();

router.get("/", getResources);

export default router;
