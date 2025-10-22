import express from "express";
import { registrar, login } from "../controllers/usuarioController.js";
import { auth, onlyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", auth, onlyAdmin, registrar); // apenas admin cria usuários
router.post("/login", login);

// 🔐 Rota temporária para criar admin inicial (sem login)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

router.post("/admin-seed", async (req, res) => {
  try {
    const existe = await prisma.usuario.findUnique({
      where: { email: "admin@ippur.pa.gov.br" },
    });
    if (existe) {
      return res.json({ ok: true, msg: "Admin já existe!" });
    }

    const hash = await bcrypt.hash("ippur2025", 10);

    const admin = await prisma.usuario.create({
      data: {
        nome: "Administrador IPPUR",
        email: "admin@ippur.pa.gov.br",
        senha: hash,
        tipo: "admin",
      },
    });

    res.json({
      ok: true,
      msg: "Usuário administrador criado com sucesso!",
      email: admin.email,
      senha: "ippur2025",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, erro: "Falha ao criar admin" });
  }
});

export default router;
