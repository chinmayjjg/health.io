import { User, type IUser } from "../models/user.model";

export const userRepository = {
  findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  },

  findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  },

  create(payload: Pick<IUser, "name" | "email" | "password" | "role">): Promise<IUser> {
    return User.create({
      ...payload,
      email: payload.email.toLowerCase(),
    });
  },
};
