const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY || '59xf0d5m',
    secretAccessKey: process.env.SECRET_KEY || 'ztxvmptw2dpcl5q5',
    endpoint: 'https://objectstorageapi.usw.sealos.io',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET = process.env.BUCKET || 'your-bucket-name';
const MODAL_API_URL = "https://yfb222333--pdf-parser-parse-pdf-api.modal.run";

async function parseWithModal(pdfUrl) {
    const response = await fetch(MODAL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_url: pdfUrl })
    });
    
    const result = await response.json();
    return result.markdown;
}

export default async function handler(req, res) {
    const { id } = req.query;
    
    // PDF文件用Modal解析
    if (id.toLowerCase().endsWith('.pdf')) {
        const pdfUrl = `https://objectstorageapi.usw.sealos.io/${BUCKET}/${id}`;
        const content = await parseWithModal(pdfUrl);
        return res.json({ success: true, message: 'success', data: { content } });
    }
    
    // 其他文件直接从S3读取
    const result = await s3.getObject({ Bucket: BUCKET, Key: id }).promise();
    const content = result.Body.toString('utf-8');
    
    res.json({ success: true, message: 'success', data: { content } });
}