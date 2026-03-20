import express from "express";
import upload from "../utils/upload.js";
import { auth } from "../middleware/auth.js";
import {
  getNoticias,
  getNoticia,
  postNoticia,
  putNoticia,
  deleteNoticia,
} from "../controllers/noticiaController.js";

const router = express.Router();

const uploadNoticias = upload.fields([
  { name: "imagem", maxCount: 1 },
  { name: "galeria", maxCount: 10 },
]);

router.get("/", getNoticias);
router.get("/:id", getNoticia);
router.post("/", auth, uploadNoticias, postNoticia);
router.put("/:id", auth, uploadNoticias, putNoticia);
router.delete("/:id", auth, deleteNoticia);

export default router;