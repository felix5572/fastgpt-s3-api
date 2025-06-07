const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
    endpoint: process.env.BUCKET_ENDPOINT || 'https://objectstorageapi.bja.sealos.run',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const PDF_PARSER_API_URL = process.env.PDF_PARSER_API_URL || "https://yfb222333--pdf-parser-parse-pdf-api.modal.run";  

async function parseWithModal(pdfUrl) {
    console.log('=== DEBUG: 调用Modal GPU API ===', pdfUrl);
    
    const response = await fetch(PDF_PARSER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_url: pdfUrl })
    });
    
    console.log('=== DEBUG: Modal响应状态 ===', response.status);
    
    const result = await response.json();
    console.log('=== DEBUG: Modal返回成功 ===', result.success);
    
    return result.markdown;
}

export default async function handler(req, res) {
    console.log('=== DEBUG: API被调用 ===');
    
    const { id } = req.query;
    console.log('=== DEBUG: 文件ID ===', id);
    
    // PDF文件用Modal GPU解析
    if (id && id.toLowerCase().endsWith('.pdf')) {
        console.log('=== DEBUG: 识别为PDF，调用GPU解析 ===');
        const pdfUrl = `${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${id}`;
        const content = await parseWithModal(pdfUrl);
        return res.json({ success: true, message: 'success', data: { content } });
    }
    
    // 其他文件直接从S3读取
    const result = await s3.getObject({ Bucket: BUCKET, Key: id }).promise();
    const content = result.Body.toString('utf-8');
    
    res.json({ success: true, message: 'success', data: { content } });
}