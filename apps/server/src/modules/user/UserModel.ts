import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
      index: true,
    },
    password: {
      type: String,
      hidden: true,
    },
    date_of_birth: { type: Date },
    phone: { type: String },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    collection: "User",
  }
);

export interface IUserAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  date_of_birth: Date;
  phone: string;
  authenticate: (plainTextPassword: string) => boolean;
  encryptPassword: (password: string | undefined) => string;
  createdAt: string;
  updatedAt: string;
}

UserSchema.pre<IUser>("save", function encryptPasswordHook(next) {
  if (this.isModified("password")) {
    this.password = this.encryptPassword(this.password);
  }

  return next();
});

UserSchema.methods = {
  authenticate(plainTextPassword: string) {
    return bcrypt.compareSync(plainTextPassword, this.password);
  },
  encryptPassword(password: string) {
    return bcrypt.hashSync(password, 8);
  },
};

const UserModel: Model<IUser> =
  mongoose.models["User"] || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
