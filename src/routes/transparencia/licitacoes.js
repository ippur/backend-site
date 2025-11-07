import express from "express";
import { auth } from "../../middleware/auth.js";
import upload from "../../utils/upload.js";
import {
  getLicitacoes,
  getLicitacao,
  postLicitacao,
  putLicitacao,
  deleteLicitacao
} from "../../controllers/transparencia/licitacaoController.js";

const router = express.Router();

router.get("/", getLicitacoes);
router.get("/:id", getLicitacao);
router.post("/", auth, upload.single("arquivo"), postLicitacao);
router.put("/:id", auth, upload.single("arquivo"), putLicitacao);
router.delete("/:id", auth, deleteLicitacao);

export default router;
