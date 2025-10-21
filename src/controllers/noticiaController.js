import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getNoticias = async (_req, res) => {
  const noticias = await prisma.noticia.findMany({ orderBy: { criadoEm: "desc" } });
  res.json(noticias);
};

export const getNoticia = async (req, res) => {
  const id = Number(req.params.id);
  const noticia = await prisma.noticia.findUnique({ where: { id } });
  if (!noticia) return res.status(404).json({ error: "Notícia não encontrada" });
  res.json(noticia);
};

export const postNoticia = async (req, res) => {
  const { titulo, resumo, conteudo } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  const noticia = await prisma.noticia.create({
    data: { titulo, resumo, conteudo, imagem },
  });
  res.json(noticia);
};

export const putNoticia = async (req, res) => {
  const id = Number(req.params.id);
  const { titulo, resumo, conteudo } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : undefined;

  const noticia = await prisma.noticia.update({
    where: { id },
    data: { titulo, resumo, conteudo, ...(imagem !== undefined ? { imagem } : {}) },
  });
  res.json(noticia);
};

export const deleteNoticia = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.noticia.delete({ where: { id } });
  res.json({ ok: true });
};
