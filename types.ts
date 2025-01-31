import { ObjectId, OptionalId } from "mongodb";

export type ContactModel = OptionalId<{
  name: string;
  phone: string;
  country: string,
  timezone: string
  friends: ObjectId[];
}>;
