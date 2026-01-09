import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.json({
        success: false,
        message: "Doctor token is required",
      });
    }

    const decoded = jwt.verify(dtoken, process.env.JWT_SECRET);

    // ✅ FIX: attach docId to req (NOT req.body)
    req.docId = decoded.id;

    next();
  } catch (error) {
    console.log("Doctor auth error:", error);
    res.json({
      success: false,
      message: "Error in doctor authentication",
    });
  }
};

export default authDoctor;
