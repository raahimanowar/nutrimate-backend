import { Router } from "express";
import { getResources, getResourceById } from "../controllers/resource.controller";

const router = Router();

router.get("/", getResources);
router.get("/:id", getResourceById);

export default router;
