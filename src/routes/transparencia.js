import express from "express";
import upload from "../utils/upload.js";
import { auth } from "../middleware/auth.js";
import { getDocs, postDoc, deleteDoc } from "../controllers/transparenciaController.js";

const router = express.Router();

router.get("/", getDocs);
router.post("/", auth, upload.single("arquivo"), postDoc);
router.delete("/:id", auth, deleteDoc);

export default router;
