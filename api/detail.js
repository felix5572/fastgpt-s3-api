const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
    endpoint: process.env.BUCKET_ENDPOINT || 'https://objectstorageapi.bja.sealos.run',
    s3ForcePathStyle: true,
    // region: 'us-east-1'
});

const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();
    
    try {
        const { id } = req.query;
        const result = await s3.headObject({ Bucket: BUCKET_NAME, Key: id }).promise();
        
        res.json({ 
            success: true, 
            message: 'success', 
            data: {
                id,
                name: id.split('/').pop(),
                size: result.ContentLength,
                type: 'file',
                updateTime: result.LastModified,
                createTime: result.LastModified
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
}