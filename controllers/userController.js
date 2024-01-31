import usermodel from "../models/usermodel.js"

export const updateUserController=async(req,res,next)=>{
    const{name,email,lastName,location}=req.body
    if(!name || !email || !lastName || !location){
        next('PLease provide all fields')
    }
    const user=await usermodel.findOne({_id:req.user.userId})
    user.name=name
    user.last_name=lastName
    user.email=email
    user.location=location

    await user.save();
    const token=user.createJWT()
    res.status(200).json({
        user,
        token,
    });
}