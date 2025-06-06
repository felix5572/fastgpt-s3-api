const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY || '59xf0d5m',
    secretAccessKey: process.env.SECRET_KEY || 'ztxvmptw2dpcl5q5',
    endpoint: 'https://objectstorageapi.usw.sealos.io',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET = process.env.BUCKET || 'your-bucket-name';

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
        
        // 生成预签名URL，有效期1小时
        const url = s3.getSignedUrl('getObject', { 
            Bucket: BUCKET, 
            Key: id, 
            Expires: 3600 
        });
        
        res.json({ 
            success: true, 
            message: 'success', 
            data: { url } 
        });
        
    } catch (error) {
        console.error('Read API error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message, 
            data: null 
        });
    }
}