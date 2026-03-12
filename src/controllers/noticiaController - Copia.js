import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🔹 GET /noticias — lista todas as notícias
export const getNoticias = async (_req, res) => {
  try {
    const noticias = await prisma.noticia.findMany({
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        imagem: true,
        criadoEm: true,
      },
    });
    res.json(noticias);
  } catch (error) {
    console.error("Erro ao listar notícias:", error);
    res.status(500).json({ error: "Erro ao buscar notícias" });
  }
};

// 🔹 GET /noticias/:id — detalhe
export const getNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const noticia = await prisma.noticia.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        conteudo: true,
        imagem: true,
        criadoEm: true,
      },
    });

    if (!noticia) {
      return res.status(404).json({ error: "Notícia não encontrada" });
    }

    res.json(noticia);
  } catch (error) {
    console.error("Erro ao buscar notícia:", error);
    res.status(500).json({ error: "Erro ao buscar notícia" });
  }
};

// 🔹 POST /noticias — cria nova
export const postNoticia = async (req, res) => {
  try {
    const { titulo, resumo, conteudo } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : null;

    const noticia = await prisma.noticia.create({
      data: { titulo, resumo, conteudo, imagem },
    });

    res.status(201).json(noticia);
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    res.status(500).json({ error: "Erro ao criar notícia" });
  }
};

// 🔹 PUT /noticias/:id — edita existente
export const putNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, resumo, conteudo } = req.body;
    const imagem = req.file ? `/uploads/${req.file.filename}` : undefined;

    const noticia = await prisma.noticia.update({
      where: { id },
      data: { titulo, resumo, conteudo, ...(imagem !== undefined ? { imagem } : {}) },
    });

    res.json(noticia);
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    res.status(500).json({ error: "Erro ao atualizar notícia" });
  }
};

// 🔹 DELETE /noticias/:id — exclui
export const deleteNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.noticia.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    res.status(500).json({ error: "Erro ao excluir notícia" });
  }
};
