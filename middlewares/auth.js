const admin = require("firebase-admin");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next(); 
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(403).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = {authMiddleware} ;
