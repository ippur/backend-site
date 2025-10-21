import express from "express";
import upload from "../utils/upload.js";
import { auth } from "../middleware/auth.js";
import {
  getLicitacoes, postLicitacao, putLicitacao, deleteLicitacao
} from "../controllers/licitacaoController.js";

const router = express.Router();

router.get("/", getLicitacoes);
router.post("/", auth, upload.single("arquivo"), postLicitacao);
router.put("/:id", auth, upload.single("arquivo"), putLicitacao);
router.delete("/:id", auth, deleteLicitacao);

export default router;
