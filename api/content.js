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
    if (req.method !== 'GET') return res.status(405).end();
    
    try {
        const { id } = req.query;
        const result = await s3.getObject({ Bucket: BUCKET, Key: id }).promise();
        const content = result.Body.toString('utf-8');
        
        res.json({ success: true, message: 'success', data: { content } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
}