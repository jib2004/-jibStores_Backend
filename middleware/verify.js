import jwt from 'jsonwebtoken'



export const verify = (req,res,next)=>{

    // Get token from cookies
    const token = req.cookies.token; 

    if (!token) {
        return res.status(403).json({ message: 'No token provided.' });
    }

    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,decoded)=>{
        if(err){
            return res.status(401).json({ message: 'Unauthorized! ' + err.message });
        }
        req.userId = decoded._id
        next()
    })
}
