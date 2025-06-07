const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
    endpoint: process.env.BUCKET_ENDPOINT || 'https://objectstorageapi.bja.sealos.run',
    s3ForcePathStyle: true,
    region: 'us-east-1'
});

const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { parentId, searchKey } = req.body;
    
    try {
        const result = await s3.listObjectsV2({
            Bucket: BUCKET_NAME,
            Prefix: parentId || '',
            Delimiter: '/'
        }).promise();
        
        const data = [];
        
        // 文件夹
        result.CommonPrefixes?.forEach(prefix => {
            const name = prefix.Prefix.slice(0, -1).split('/').pop();
            if (!searchKey || name.includes(searchKey)) {
                data.push({
                    id: prefix.Prefix,
                    parentId: parentId || null,
                    name,
                    type: 'folder',
                    updateTime: new Date(),
                    createTime: new Date()
                });
            }
        });
        
        // 文件
        result.Contents?.forEach(obj => {
            if (!obj.Key.endsWith('/')) {
                const name = obj.Key.split('/').pop();
                if (!searchKey || name.includes(searchKey)) {
                    data.push({
                        id: obj.Key,
                        parentId: parentId || null,
                        name,
                        type: 'file',
                        updateTime: obj.LastModified,
                        createTime: obj.LastModified
                    });
                }
            }
        });
        
        res.json({ success: true, message: 'success', data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data: null });
    }
}