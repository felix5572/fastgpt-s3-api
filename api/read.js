const BUCKET_ENDPOINT = process.env.BUCKET_ENDPOINT || 'https://objectstorageapi.bja.sealos.run';
const BUCKET_NAME = process.env.BUCKET_NAME;

export default async function handler(req, res) {
    const { id } = req.query;
    
    const url = `${BUCKET_ENDPOINT}/${BUCKET_NAME}/${id}`;
    
    res.json({ 
        success: true, 
        message: 'success', 
        data: { url } 
    });
}