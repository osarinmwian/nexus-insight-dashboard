import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join('./uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const stat = fs.statSync(filePath);
  const fileExtension = path.extname(filename);
  
  let contentType = 'application/octet-stream';
  if (fileExtension === '.apk') {
    contentType = 'application/vnd.android.package-archive';
  } else if (fileExtension === '.aab') {
    contentType = 'application/x-authorware-bin';
  }
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}