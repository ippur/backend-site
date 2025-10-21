import express from "express";
import upload from "../utils/upload.js";
import { auth } from "../middleware/auth.js";
import {
  getNoticias, getNoticia, postNoticia, putNoticia, deleteNoticia
} from "../controllers/noticiaController.js";

const router = express.Router();

router.get("/", getNoticias);
router.get("/:id", getNoticia);
router.post("/", auth, upload.single("imagem"), postNoticia);
router.put("/:id", auth, upload.single("imagem"), putNoticia);
router.delete("/:id", auth, deleteNoticia);

export default router;
