import jwt from 'jsonwebtoken';
import 'dotenv/config';

 const authAdmin = async (req, res,next) => {
    try{
        const {atoken} = req.headers ;
        if(!atoken)
        {
            return res.json({success:false,message:"Admin token is required"});
        }
        
        const token_decoded = jwt.verify(atoken,process.env.JWT_SECRET);
        const adminEmail = process.env.ADMIN_EMAIL?.trim() || '';
        const adminPassword = process.env.ADMIN_PASSWORD?.trim() || '';
        const expectedValue = adminEmail + adminPassword;
        
        const validNew = token_decoded.admin === expectedValue;
        const validLegacy = token_decoded.role === 'admin' || (token_decoded.email && token_decoded.email === adminEmail);
        
        if(!(validNew || validLegacy))
        {
            return res.json({success:false,message:"Invalid admin token"});
        }
        else{
          next();
        }

    }
    catch(error){
        console.log("Admin auth error:", error);
        res.json({success:false,message:"Error in admin authentication"});
    }
 }

export default authAdmin;
