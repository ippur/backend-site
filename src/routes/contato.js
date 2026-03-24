import express from "express";
import multer from "multer";
import { enviarContato } from "../controllers/contatoController.js";

console.log("=== ROTA CONTATO ATIVA ===");

const router = express.Router();

const uploadContato = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

router.post("/", uploadContato.single("anexo"), enviarContato);

export default router;