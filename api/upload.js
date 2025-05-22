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

  let uploadPromise = null;

  bb.on('file', (fieldname, file, info) => {
    const { filename, mimeType } = info;

    uploadPromise = new Promise((resolve, reject) => {
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const newFileName = getFileName(filename);

          const { data, error } = await supabase.storage
            .from('imagens')
            .upload(`uploads/${newFileName}`, buffer, {
              contentType: mimeType || 'image/jpeg',
              upsert: false,
            });

          if (error || !data?.path) {
            return reject(error || 'Path da imagem ausente');
          }

          const { data: publicUrl } = supabase.storage
            .from('imagens')
            .getPublicUrl(data.path);

          resolve(publicUrl.publicUrl);
        } catch (err) {
          reject(err);
        }
      });
    });
  });

  bb.on('finish', async () => {
    try {
      if (!uploadPromise) throw new Error('Nenhum arquivo processado');
      const imageUrl = await uploadPromise;
      return res.status(200).json({ caminho: imageUrl });
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      return res.status(500).json({ error: 'Erro ao enviar imagem' });
    }
  });

  req.pipe(bb);
}
