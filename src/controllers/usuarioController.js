import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

export const registrar = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ error: "E-mail já cadastrado" });

    const hash = await bcrypt.hash(senha, 10);
    const user = await prisma.usuario.create({
      data: { nome, email, senha: hash, tipo: tipo || "editor" },
    });
    res.json({ id: user.id, nome: user.nome, email: user.email, tipo: user.tipo });
  } catch (e) {
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({ token, usuario: { id: user.id, nome: user.nome, tipo: user.tipo } });
  } catch (e) {
    res.status(500).json({ error: "Erro ao autenticar" });
  }
};
