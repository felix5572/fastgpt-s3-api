const AWS = require('aws-sdk');
const pdf = require('pdf-parse');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY || '59xf0d5m',
    secretAccessKey: process.env.SECRET_KEY || 'ztxvmptw2dpcl5q5',
    endpoint: 'https://objectstorageapi.usw.sealos.io',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET = process.env.BUCKET || 'your-bucket-name';

async function parsePdfToText(pdfUrl) {
    try {
        console.log('开始解析PDF:', pdfUrl);
        const response = await fetch(pdfUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        
        console.log('PDF解析成功，文本长度:', data.text.length);
        return data.text;
    } catch (error) {
        console.error('PDF解析失败:', error);
        return `# PDF解析失败\n\n错误信息：${error.message}\n\n请尝试直接查看原文件。`;
    }
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed', 
            data: null 
        });
    }
    
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'File ID is required', 
                data: null 
            });
        }
        
        // 检查是否为PDF文件
        if (id.toLowerCase().endsWith('.pdf')) {
            const pdfUrl = `https://objectstorageapi.usw.sealos.io/${BUCKET}/${id}`;
            const content = await parsePdfToText(pdfUrl);
            
            return res.json({ 
                success: true, 
                message: 'success', 
                data: { content }
            });
        }
        
        // 处理其他文件（文本文件）
        const result = await s3.getObject({ Bucket: BUCKET, Key: id }).promise();
        const content = result.Body.toString('utf-8');
        
        res.json({ 
            success: true, 
            message: 'success', 
            data: { content } 
        });
        
    } catch (error) {
        console.error('Content API error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message, 
            data: null 
        });
    }
}