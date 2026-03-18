// src/controllers/transparencia/transparenciaController.js
import { PrismaClient } from "@prisma/client";
import { supabase, BUCKET } from "../../utils/supabase.js";
import { removerArquivoDoSupabase } from "../../utils/supabaseStorage.js";

const prisma = new PrismaClient();

function sanitizeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

async function uploadArquivoParaSupabase(file, pasta = "transparencia") {
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
 * GET /api/transparencia?tipo=receita|despesa|convenio|...
 */
export const getTransparencia = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = tipo
      ? { tipo: { equals: String(tipo), mode: "insensitive" } }
      : {};

    const documentos = await prisma.documentoTransparencia.findMany({
      where,
      orderBy: { data: "desc" },
    });

    res.json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ error: "Erro ao buscar documentos de transparência" });
  }
};

/** GET /api/transparencia/:id */
export const getDocumento = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const documento = await prisma.documentoTransparencia.findUnique({
      where: { id },
    });

    if (!documento) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    res.json(documento);
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    res.status(500).json({ error: "Erro ao buscar documento" });
  }
};

/** POST /api/transparencia (multipart com campo 'arquivo') */
export const postTransparencia = async (req, res) => {
  try {

    // 🔍 TESTE PARA SABER SE ESTE CONTROLLER ESTÁ SENDO EXECUTADO
    console.log("=== CONTROLLER NOVO DE TRANSPARENCIA ATIVO ===");
    console.log("REQ.FILE =", req.file);

    const { titulo, tipo, data, comentarios } = req.body;

    let arquivo = null;

    if (req.file) {
      arquivo = await uploadArquivoParaSupabase(req.file, "transparencia");
    }

    const novoDoc = await prisma.documentoTransparencia.create({
      data: {
        titulo,
        tipo,
        data: new Date(data),
        comentarios,
        arquivo,
      },
    });

    res.json(novoDoc);
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    res.status(500).json({ error: "Erro ao criar documento" });
  }
};

/** PUT /api/transparencia/:id (multipart opcional) */
export const putTransparencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, tipo, data, comentarios } = req.body;

    let arquivo;

    if (req.file) {
      arquivo = await uploadArquivoParaSupabase(req.file, "transparencia");
    }

    const atualizado = await prisma.documentoTransparencia.update({
      where: { id },
      data: {
        titulo,
        tipo,
        data: new Date(data),
        comentarios,
        ...(arquivo ? { arquivo } : {}),
      },
    });

    res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    res.status(500).json({ error: "Erro ao atualizar documento de transparência" });
  }
};

/** DELETE /api/transparencia/:id */
export const deleteTransparencia = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const documento = await prisma.documentoTransparencia.findUnique({
      where: { id },
    });

    if (!documento) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    // Tenta remover o arquivo do Supabase antes de excluir o registro
    if (documento.arquivo) {
      await removerArquivoDoSupabase(documento.arquivo);
    }

    await prisma.documentoTransparencia.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    res.status(500).json({ error: "Erro ao deletar documento de transparência" });
  }
};