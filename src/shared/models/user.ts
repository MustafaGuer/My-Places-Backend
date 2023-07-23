import { Schema, model, Types } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

interface IUser {
  name: string;
  email: string;
  password: string;
  image: string;
  places: Types.Array<Types.ObjectId>;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  places: [{ type: Schema.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(mongooseUniqueValidator);

const User = model<IUser>("User", userSchema);

export default User;
