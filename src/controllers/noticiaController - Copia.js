import { PrismaClient } from "@prisma/client";
import { supabase, BUCKET } from "../utils/supabase.js";
import { removerArquivoDoSupabase } from "../utils/supabaseStorage.js";

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

  const agora = new Date();
  const ano = String(agora.getFullYear());
  const mes = String(agora.getMonth() + 1).padStart(2, "0");

  const fileName = `${pasta}/${ano}/${mes}/${Date.now()}-${safeName}`;

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
        galeria: {
          select: {
            id: true,
            url: true,
            criadoEm: true,
          },
          orderBy: { criadoEm: "asc" },
        },
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
    const { titulo, resumo, conteudo } = req.body;

    const imagemCapa = req.files?.imagem?.[0] || null;
    const imagensGaleria = req.files?.galeria || [];

    let imagem = null;

    if (imagemCapa) {
      imagem = await uploadImagemParaSupabase(imagemCapa, "noticias");
    }

    const noticia = await prisma.noticia.create({
      data: {
        titulo,
        resumo,
        conteudo,
        imagem,
      },
    });

    if (imagensGaleria.length > 0) {
      const urlsGaleria = [];

      for (const file of imagensGaleria) {
        const url = await uploadImagemParaSupabase(file, "noticias/galeria");
        urlsGaleria.push(url);
      }

      await prisma.noticiaImagem.createMany({
        data: urlsGaleria.map((url) => ({
          noticiaId: noticia.id,
          url,
        })),
      });
    }

    const noticiaCompleta = await prisma.noticia.findUnique({
      where: { id: noticia.id },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        conteudo: true,
        imagem: true,
        criadoEm: true,
        galeria: {
          select: {
            id: true,
            url: true,
            criadoEm: true,
          },
          orderBy: { criadoEm: "asc" },
        },
      },
    });

    res.status(201).json(noticiaCompleta);
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

    const noticiaAtual = await prisma.noticia.findUnique({
      where: { id },
      include: { galeria: true },
    });

    if (!noticiaAtual) {
      return res.status(404).json({ error: "Notícia não encontrada" });
    }

    const imagemCapa = req.files?.imagem?.[0] || null;
    const imagensGaleria = req.files?.galeria || [];

    let imagem;

    if (imagemCapa) {
      // remove capa antiga, se existir
      if (noticiaAtual.imagem) {
        await removerArquivoDoSupabase(noticiaAtual.imagem);
      }

      imagem = await uploadImagemParaSupabase(imagemCapa, "noticias");
    }

    await prisma.noticia.update({
      where: { id },
      data: {
        titulo,
        resumo,
        conteudo,
        ...(imagem ? { imagem } : {}),
      },
    });

    // adiciona novas imagens na galeria sem apagar as antigas
    if (imagensGaleria.length > 0) {
      const urlsGaleria = [];

      for (const file of imagensGaleria) {
        const url = await uploadImagemParaSupabase(file, "noticias/galeria");
        urlsGaleria.push(url);
      }

      await prisma.noticiaImagem.createMany({
        data: urlsGaleria.map((url) => ({
          noticiaId: id,
          url,
        })),
      });
    }

    const noticiaAtualizada = await prisma.noticia.findUnique({
      where: { id },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        conteudo: true,
        imagem: true,
        criadoEm: true,
        galeria: {
          select: {
            id: true,
            url: true,
            criadoEm: true,
          },
          orderBy: { criadoEm: "asc" },
        },
      },
    });

    res.json(noticiaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar notícia:", error);
    res.status(500).json({ error: "Erro ao atualizar notícia" });
  }
};

// DELETE /noticias/:id — exclui
export const deleteNoticia = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const noticia = await prisma.noticia.findUnique({
      where: { id },
      include: { galeria: true },
    });

    if (!noticia) {
      return res.status(404).json({ error: "Notícia não encontrada" });
    }

    // remove imagem principal
    if (noticia.imagem) {
      await removerArquivoDoSupabase(noticia.imagem);
    }

    // remove imagens da galeria
    if (noticia.galeria?.length) {
      for (const img of noticia.galeria) {
        await removerArquivoDoSupabase(img.url);
      }
    }

    await prisma.noticia.delete({
      where: { id },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir notícia:", error);
    res.status(500).json({ error: "Erro ao excluir notícia" });
  }
};