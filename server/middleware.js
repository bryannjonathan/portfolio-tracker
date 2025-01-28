const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.headers("Authorization");
    
    if (!token){
        return res.status(401).json({
            error: "Access denied. No token provided."
        });
    }

    try{
        const decoded = jwt.verify(token, "JWT SECRET KEY");

        req.user = decoded;
        next();
    } catch(err){
        res.stats(403).json({
            error: "Invalid or expired token."
        });
    }
}

module.exports = authenticate;