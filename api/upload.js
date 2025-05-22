// api/upload.js
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

function getFileName(fileName) {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/\s+/g, '_');
  return `${timestamp}_${sanitized}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const busboy = (await import('busboy')).default;
  const bb = busboy({ headers: req.headers });

  let result = null;

  bb.on('file', async (fieldname, file, info) => {
    const { filename, mimeType } = info;

    const chunks = [];
    file.on('data', (data) => chunks.push(data));
    file.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const newFileName = getFileName(filename);

      const { data, error } = await supabase.storage
        .from('imagens')
        .upload(`uploads/${newFileName}`, buffer, {
          contentType: mimeType || 'image/jpeg',
          upsert: false,
        });

      if (error) {
        result = { success: false, error };
        return;
      }

      if (!data?.path) {
        result = { success: false, error: 'Path da imagem ausente' };
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from('imagens')
        .getPublicUrl(data.path);

      result = { success: true, url: publicUrl.publicUrl };
    });
  });

  bb.on('finish', () => {
    if (result?.success) {
      res.status(200).json({ caminho: result.url });
    } else {
      console.error(result?.error || 'Erro desconhecido');
      res.status(500).json({ error: 'Erro ao enviar imagem' });
    }
  });

  req.pipe(bb);
}
