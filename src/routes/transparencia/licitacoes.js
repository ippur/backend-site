import express from "express";
import { auth } from "../../middleware/auth.js";
import upload from "../../utils/upload.js";
import {
  getLicitacoes,
  getLicitacao,
  postLicitacao,
  putLicitacao,
  deleteLicitacao,
} from "../../controllers/transparencia/licitacaoController.js";

const router = express.Router();

// 🔹 Listar todas as licitações
router.get("/", getLicitacoes);

// 🔹 Obter uma licitação específica por ID
router.get("/:id", getLicitacao);

// 🔹 Criar uma nova licitação (rota protegida e com upload)
router.post("/", auth, upload.single("arquivo"), postLicitacao);

// 🔹 Atualizar uma licitação (rota protegida e com upload opcional)
router.put("/:id", auth, upload.single("arquivo"), putLicitacao);

// 🔹 Excluir uma licitação (rota protegida)
router.delete("/:id", auth, deleteLicitacao);

export default router;
