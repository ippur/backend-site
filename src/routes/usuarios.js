import express from "express";
import { registrar, login } from "../controllers/usuarioController.js";
import { auth, onlyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", auth, onlyAdmin, registrar); // apenas admin cria usuários
router.post("/login", login);

export default router;
