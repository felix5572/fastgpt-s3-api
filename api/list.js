const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
    endpoint: process.env.BUCKET_ENDPOINT || 'https://objectstorageapi.bja.sealos.run',
    s3ForcePathStyle: true,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { parentId = "", searchKey = "" } = req.body;
    
    try {
        const result = await s3.listObjectsV2({
            Bucket: process.env.BUCKET_NAME,
            Prefix: parentId,
            Delimiter: '/'
        }).promise();
        
        const data = [];
        
        // 文件夹
        result.CommonPrefixes?.forEach(prefix => {
            const name = prefix.Prefix.slice(0, -1).split('/').pop();
            data.push({
                id: prefix.Prefix,
                parentId: parentId || null,
                type: "folder",
                name,
                updateTime: new Date().toISOString(),
                createTime: new Date().toISOString()
            });
        });
        
        // 文件
        result.Contents?.forEach(obj => {
            if (!obj.Key.endsWith('/')) {
                const name = obj.Key.split('/').pop();
                if (name === '_#') return;
                data.push({
                    id: obj.Key,
                    parentId: parentId || null,
                    type: "file", 
                    name,
                    updateTime: obj.LastModified.toISOString(),
                    createTime: obj.LastModified.toISOString()
                });
            }
        });
        
        res.json({
            code: 200,
            success: true,
            message: "",
            data
        });
        
    } catch (error) {
        res.status(500).json({
            code: 500,
            success: false,
            message: error.message,
            data: null
        });
    }
}