import { supabase, BUCKET } from "./supabase.js";

/**
 * Extrai o path interno do arquivo no bucket a partir da URL pública.
 * Exemplo:
 * https://xxxx.supabase.co/storage/v1/object/public/ippur-arquivos/transparencia/2026/03/arquivo.pdf
 * =>
 * transparencia/2026/03/arquivo.pdf
 */
export function extrairPathDaUrlPublica(url) {
  if (!url || typeof url !== "string") return null;

  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marcador);

  if (idx === -1) return null;

  return decodeURIComponent(url.slice(idx + marcador.length));
}

/**
 * Remove um arquivo do Supabase a partir da URL pública salva no banco.
 * Se a URL não for do Supabase, apenas ignora.
 */
export async function removerArquivoDoSupabase(url) {
  const path = extrairPathDaUrlPublica(url);

  if (!path) {
    return {
      ok: false,
      ignorado: true,
      motivo: "URL inválida ou não pertence ao bucket público esperado.",
    };
  }

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(`Erro ao remover arquivo do Supabase: ${error.message}`);
  }

  return {
    ok: true,
    ignorado: false,
    path,
  };
}