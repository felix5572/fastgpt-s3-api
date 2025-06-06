const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY || '59xf0d5m',
    secretAccessKey: process.env.SECRET_KEY || 'ztxvmptw2dpcl5q5',
    endpoint: 'https://objectstorageapi.usw.sealos.io',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET = process.env.BUCKET || '59xf0d5m-deepmd-paper';  
const MODAL_API_URL = "https://yfb222333--pdf-parser-parse-pdf-api.modal.run";

async function parseWithModal(pdfUrl) {
    console.log('=== DEBUG: 调用Modal API ===', pdfUrl);
    
    const response = await fetch(MODAL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_url: pdfUrl })
    });
    
    console.log('=== DEBUG: Modal响应状态 ===', response.status);
    
    const result = await response.json();
    console.log('=== DEBUG: Modal返回数据 ===', result.success);
    
    return result.markdown;
}

export default async function handler(req, res) {
    console.log('=== DEBUG: API被调用 ===');
    
    const { id } = req.query;
    console.log('=== DEBUG: 文件ID ===', id);
    
    // PDF文件用Modal解析
    if (id && id.toLowerCase().endsWith('.pdf')) {
        console.log('=== DEBUG: 识别为PDF ===');
        const pdfUrl = `https://objectstorageapi.usw.sealos.io/${BUCKET}/${id}`;
        console.log('=== DEBUG: PDF URL ===', pdfUrl);
        
        const content = await parseWithModal(pdfUrl);
        return res.json({ success: true, message: 'success', data: { content } });
    }
    
    console.log('=== DEBUG: 处理非PDF文件 ===');
    
    // 其他文件直接从S3读取
    const result = await s3.getObject({ Bucket: BUCKET, Key: id }).promise();
    const content = result.Body.toString('utf-8');
    
    res.json({ success: true, message: 'success', data: { content } });
}