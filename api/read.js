const BUCKET = process.env.BUCKET || 'your-bucket-name';

export default async function handler(req, res) {
    const { id } = req.query;
    
    const url = `https://objectstorageapi.bja.sealos.run/${BUCKET}/${id}`;
    
    res.json({ 
        success: true, 
        message: 'success', 
        data: { url } 
    });
}