import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiErrors.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/fileUpload.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    // validation
    // check if user already exist: username, email
    // check for images, avatar
    // upload them from coudinary, avatar
    // create user object - create entr in database
    // remove password and refresh token field from response
    // check for user creation 
    // retrun response

    const {fullName, email, username, password} = req.body
   // console.log("email: ",  email);
    console.log("Request body:", req.body);
// 


    if (
        [fullName, email, username, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPAth = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPAth);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }
    






    // The below commented code was to test only in the very beginning.
    // return res.status(200).json({
    //     message: "OK"
    // })
})


export { registerUser }