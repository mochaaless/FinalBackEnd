import { ObjectId, OptionalId } from "mongodb";

export type RestaurantModel = OptionalId<{
  name: string;
  address: string;
  city: string,
  phone: string,
  country: string,
  timezone: string,
  latitude: string,
  longitude: string
}>;
