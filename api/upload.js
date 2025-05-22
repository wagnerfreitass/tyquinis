// api/upload.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Função auxiliar para extrair o nome do arquivo
function getFileName(fileName) {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/\s+/g, '_');
  return `${timestamp}_${sanitized}`;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const busboy = await import('busboy');
  const bb = busboy.default({ headers: req.headers });

  let uploadComplete = false;
  let imageUrl = null;

  bb.on('file', async (fieldname, file, filename) => {
    const chunks = [];
    file.on('data', (data) => chunks.push(data));
    file.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const newFileName = getFileName(filename);

      const { data, error } = await supabase.storage
        .from('imagens') // <- o nome do seu bucket
        .upload(`uploads/${newFileName}`, buffer, {
          contentType: 'image/jpeg', // ou 'image/png' conforme o tipo
          upsert: false,
        });

      if (error) {
        console.error('Erro ao fazer upload:', error);
        return res.status(500).json({ error: 'Erro ao enviar imagem' });
      }

      const { data: publicUrl } = supabase.storage
        .from('imagens')
        .getPublicUrl(data.path);

      imageUrl = publicUrl.publicUrl;
      uploadComplete = true;
    });
  });

  bb.on('finish', () => {
    if (uploadComplete && imageUrl) {
      return res.status(200).json({ caminho: imageUrl });
    } else {
      return res.status(500).json({ error: 'Erro ao processar imagem' });
    }
  });

  req.pipe(bb);
}
