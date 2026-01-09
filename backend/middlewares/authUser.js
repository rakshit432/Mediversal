import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const token = req.headers.token;

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized. Login Again"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ attach to request, NOT body
    req.userId = decoded.id;

    next();
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error in user authentication"
    });
  }
};

export default authUser;
