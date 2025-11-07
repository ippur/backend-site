// src/routes/transparencia/index.js
import express from "express";
import upload from "../../utils/upload.js";
import { auth } from "../../middleware/auth.js";
import {
  getTransparencia,
  getDocumento,
  postTransparencia,
  putTransparencia,
  deleteTransparencia,
} from "../../controllers/transparencia/transparenciaController.js";
import licitacoesRoutes from "./licitacoes.js";

const router = express.Router();

// Documentos de transparência
router.get("/", getTransparencia);
router.get("/:id", getDocumento);
router.post("/", auth, upload.single("arquivo"), postTransparencia);
router.put("/:id", auth, upload.single("arquivo"), putTransparencia);
router.delete("/:id", auth, deleteTransparencia);

// Subrotas: /api/transparencia/licitacoes
router.use("/licitacoes", licitacoesRoutes);

export default router;
