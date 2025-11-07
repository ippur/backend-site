import express from "express";
import transparenciaController from "../../controllers/transparencia/transparenciaController.js";
import licitacoesRoutes from "./licitacoes.js";

const router = express.Router();

// Documentos de transparência
router.get("/documentos", transparenciaController.getDocumentos);

// Subrotas de licitações e contratos
router.use("/licitacoes", licitacoesRoutes);

export default router;
