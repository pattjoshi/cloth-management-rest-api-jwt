// all login written in registerController.js
import Joi from "joi";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt";
import jwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const registerController = {
  async register(req, res, next) {
    // CHECKLIST
    // [ ] validate the request
    // [ ] authorise the request
    // [ ] check if user is in the database already
    // [ ] prepare model
    // [ ] store in database
    // [ ] generate jwt token
    // [ ] send response

    // validate the request
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(30).required(), // theis is method chaning

      email: Joi.string().email().required(),
      password: Joi.string()
        .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
        .required(),
      repeat_password: Joi.ref("password"),
    });
    const { error } = registerSchema.validate(req.body); // this validate which  is come from req.body

    if (error) {
      return next(error);
    }

    // check if user is in the database already
    try {
      const exist = await User.exists({ email: req.body.email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("This email is already taken")
        );
      }
    } catch (error) {
      return next(error);
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // prepare model
    const { name, email } = req.body;
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // store in database
    let access_token;
    let refresh_token;
    try {
      const result = await user.save();
      //   console.log(result);
      // generate jwt token
      access_token = jwtService.sign({ _id: result._id, role: result.role });
      refresh_token = jwtService.sign(
        { _id: result._id, role: result.role },
        "1y",
        REFRESH_SECRET
      );
      // database widelist
      await RefreshToken.create({ token: refresh_token });
    } catch (error) {
      return next(error);
    }

    res.json({ access_token, refresh_token });
  },
};

export default registerController;
