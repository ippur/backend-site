import { PrismaClient } from "@prisma/client";
import { supabase, BUCKET } from "../../utils/supabase.js";

const prisma = new PrismaClient();

function sanitizeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

async function uploadArquivoParaSupabase(file, pasta = "licitacoes") {
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
    throw new Error(`Erro ao enviar arquivo para o Supabase: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Retorna todas as licitações, ordenadas por data de criação
 */
export const getLicitacoes = async (_req, res) => {
  try {
    const list = await prisma.licitacao.findMany({
      orderBy: { criadoEm: "desc" },
    });

    res.json(list);
  } catch (error) {
    console.error("Erro ao buscar licitações:", error);
    res.status(500).json({ error: "Erro ao buscar licitações" });
  }
};

/**
 * Retorna uma licitação específica por ID
 */
export const getLicitacao = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const item = await prisma.licitacao.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ error: "Licitação não encontrada" });
    }

    res.json(item);
  } catch (error) {
    console.error("Erro ao buscar licitação:", error);
    res.status(500).json({ error: "Erro ao buscar licitação" });
  }
};

/**
 * Cria uma nova licitação
 */
export const postLicitacao = async (req, res) => {
  try {

    // 🔍 TESTE PARA SABER SE ESTE CONTROLLER ESTÁ SENDO EXECUTADO
    console.log("=== CONTROLLER NOVO DE LICITACAO ATIVO ===");
    console.log("REQ.FILE =", req.file);
    
    const { titulo, modalidade, status, data, comentarios } = req.body;

    let arquivo = null;

    if (req.file) {
      arquivo = await uploadArquivoParaSupabase(req.file, "licitacoes");
    }

    const item = await prisma.licitacao.create({
      data: {
        titulo,
        modalidade,
        status,
        data: new Date(data),
        arquivo,
        comentarios,
      },
    });

    res.json(item);
  } catch (error) {
    console.error("Erro ao criar licitação:", error);
    res.status(500).json({ error: "Erro ao criar licitação" });
  }
};

/**
 * Atualiza uma licitação existente
 */
export const putLicitacao = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { titulo, modalidade, status, data, comentarios } = req.body;

    let arquivo;

    if (req.file) {
      arquivo = await uploadArquivoParaSupabase(req.file, "licitacoes");
    }

    const item = await prisma.licitacao.update({
      where: { id },
      data: {
        titulo,
        modalidade,
        status,
        comentarios,
        ...(data ? { data: new Date(data) } : {}),
        ...(arquivo ? { arquivo } : {}),
      },
    });

    res.json(item);
  } catch (error) {
    console.error("Erro ao atualizar licitação:", error);
    res.status(500).json({ error: "Erro ao atualizar licitação" });
  }
};

/**
 * Exclui uma licitação
 */
export const deleteLicitacao = async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.licitacao.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir licitação:", error);
    res.status(500).json({ error: "Erro ao excluir licitação" });
  }
};