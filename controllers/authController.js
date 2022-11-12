import BadRequestError from "../errors/bad-request.js";
import { StatusCodes } from "http-status-codes";
import UnAuthenticatedError from "../errors/unauthenticated.js";
import User from "../models/User.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new BadRequestError("Please provide all values");
    }
    const user = await User.findOne({
        username: username.toLowerCase(),
    }).select("+password");

    if (!user) {
        throw new UnAuthenticatedError("Email address not found");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnAuthenticatedError("Invalid Credentials");
    }
    const token = user.createJWT();
    user.password = undefined;
    res.status(StatusCodes.OK).json({
        msg: `Login successfull!`,
        user,
        token,
    });
};
const register = async (req, res) => {
    var { username, password, mobile, role } = req.body;

    if (!username || !password) {
        throw new BadRequestError("Please provide all values");
    }

    if (role === "Admin") {
        const admins = await User.find({ role });
        if (admins.length >= 1) {
            throw new BadRequestError("Cannot create more than 1 admin");
        }
    }

    username = username.toLowerCase();

    const userNameExists = await User.findOne({
        username,
    });
    if (userNameExists) {
        throw new BadRequestError("Username already exists");
    }

    const user = await User.create({ ...req.body, username });

    const token = user.createJWT();

    user.password = undefined;
    res.status(StatusCodes.OK).json({
        msg: `Registered successfully!`,
        user,
        token,
    });
};

export { login, register };
