import { PrismaClient } from "@prisma/client";
import { supabase, BUCKET } from "../utils/supabase.js";

const prisma = new PrismaClient();

function sanitizeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

async function uploadImagemParaSupabase(file, pasta = "noticias") {
  if (!file) return null;

  const safeName = sanitizeFileName(file.originalname);
  const fileName = `${pasta}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Erro ao enviar imagem para o Supabase: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return data.publicUrl;
}

// GET /noticias — lista todas as notícias
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

// GET /noticias/:id — detalhe
export const getNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const noticia = await prisma.noticia.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        resumo: true,
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

// POST /noticias — cria nova
export const postNoticia = async (req, res) => {
  try {

    // 🔍 TESTE PARA SABER SE ESTE CONTROLLER ESTÁ SENDO EXECUTADO
    console.log("=== CONTROLLER NOVO DE NOTICIA ATIVO ===");
    console.log("REQ.FILE =", req.file);

    const { titulo, resumo, conteudo } = req.body;

    let imagem = null;

    if (req.file) {
      imagem = await uploadImagemParaSupabase(req.file, "noticias");
    }

    const noticia = await prisma.noticia.create({
      data: {
        titulo,
        resumo,
        conteudo,
        imagem,
      },
    });

    res.status(201).json(noticia);
  } catch (error) {
    console.error("Erro ao criar notícia:", error);
    res.status(500).json({ error: "Erro ao criar notícia" });
  }
};

// PUT /noticias/:id — edita existente
export const putNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, resumo, conteudo } = req.body;

    let imagem;

    if (req.file) {
      imagem = await uploadImagemParaSupabase(req.file, "noticias");
    }

    const noticia = await prisma.noticia.update({
      where: { id },
      data: {
        titulo,
        resumo,
        conteudo,
        ...(imagem ? { imagem } : {}),
      },
    });

    res.json(noticia);
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    res.status(500).json({ error: "Erro ao atualizar notícia" });
  }
};

// DELETE /noticias/:id — exclui
export const deleteNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.noticia.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    res.status(500).json({ error: "Erro ao excluir notícia" });
  }
};