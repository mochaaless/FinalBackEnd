import { Collection, ObjectId } from "mongodb";
import { RestaurantModel } from "./types.ts";
import { GraphQLError } from "graphql";


type Context = {
  RestaurantsCollection: Collection<RestaurantModel>
}

type addRestaurantParams = {
  name: string,
  address: string,
  city: string,
  phone: string
}

type getRestaurantsParams = {
  city: string
}

type getRestaurantParams = {
  id: string
}

type deleteRestaurantParams = {
  id: string
}

export const resolvers = {
  Query: {
    getRestaurants: async (_:unknown, args:getRestaurantsParams, ctx: Context): Promise<RestaurantModel[]> => {
      return await ctx.RestaurantsCollection.find({city: args.city}).toArray()
    },
    getRestaurant: async (_:unknown, args:getRestaurantParams, ctx: Context): Promise<RestaurantModel> => {

      const restaurant = await ctx.RestaurantsCollection.findOne({_id: new ObjectId(args.id)})
      if (!restaurant) throw new GraphQLError("Restaurant not found in DB")
      return restaurant
    }
  },
  Mutation: {
    
    addRestaturant: async (_:unknown, args: addRestaurantParams, ctx: Context) : Promise<RestaurantModel> => {

      const phone = (args.phone).includes("+") ? args.phone : `+${args.phone}`
      const countSamePhone = await ctx.RestaurantsCollection.countDocuments({phone})
      if (countSamePhone > 0) throw new GraphQLError("Phone is already in DB!")

      const NINJA_API_KEY = Deno.env.get("NINJA_API_KEY")
      if (!NINJA_API_KEY) throw new GraphQLError("Ninja API key not found")
      
      const validatePhoneResponse = await fetch(`https://api.api-ninjas.com/v1/validatephone?number=${phone}`, {
        headers: {
          "X-Api-Key": NINJA_API_KEY
        }
      })

      if (validatePhoneResponse.status !== 200) throw new GraphQLError("Error validating phone, remember to write also with +34...")
      
      const data = await validatePhoneResponse.json()
      if (!data?.is_valid) throw new GraphQLError("Phone is not valid, remember to write also with +34...")

      const getLatitudeLongitudeResponse = await fetch(`https://api.api-ninjas.com/v1/geocoding?city=${args.city}`, {
        headers: {
          "X-Api-Key": NINJA_API_KEY
        }
      })

      if (getLatitudeLongitudeResponse.status !== 200) throw new GraphQLError("Error getting latitude and longitude")
      const data2 = await getLatitudeLongitudeResponse.json()
      
      const restaurantToAdd = {
        name: args.name,
        address: args.address,
        city: args.city,
        phone,
        country: data.country,
        timezone: data.timezones[0],
        latitude: (data2[0].latitude).toString(),
        longitude: (data2[0].longitude).toString()
      }

      const { insertedId } = await ctx.RestaurantsCollection.insertOne(restaurantToAdd)

      return {
        _id: insertedId,
        ...restaurantToAdd
      }
    },

    deleteRestaurant: async (_:unknown, args: deleteRestaurantParams, ctx: Context) : Promise<boolean> => {

      const { deletedCount } = await ctx.RestaurantsCollection.deleteOne({ _id: new ObjectId(args.id)})
      return deletedCount === 1
    }
  },

  Restaurant: {
    id: (parent: RestaurantModel) : string => parent._id.toString(),

    address: (parent: RestaurantModel): string => `${parent.address}, ${parent.city}, ${parent.country}`,

    time: async (parent: RestaurantModel) : Promise<string> => {

      const NINJA_API_KEY = Deno.env.get("NINJA_API_KEY")
      if (!NINJA_API_KEY) throw new GraphQLError("Ninja API key not found")
      
      const getTimeResponse = await fetch(`https://api.api-ninjas.com/v1/worldtime?timezone=${parent.timezone}`, {
        headers: {
          "X-Api-Key": NINJA_API_KEY
        }
      })

      if (getTimeResponse.status !== 200) throw new GraphQLError("Error getting actual time")
      const data = await getTimeResponse.json()
      if (!data?.hour || !data?.minute) throw new GraphQLError("Time not found, error")

      const time = `${data.hour}:${data.minute}`
      return time

    },
    temperature: async (parent: RestaurantModel): Promise<string> => {
      const NINJA_API_KEY = Deno.env.get("NINJA_API_KEY")
      if (!NINJA_API_KEY) throw new GraphQLError("Ninja API key not found")
      
      const getTimeResponse = await fetch(`https://api.api-ninjas.com/v1/weather?lat=${parent.latitude}&lon=${parent.longitude}`, {
        headers: {
          "X-Api-Key": NINJA_API_KEY
        }
      })

      if (getTimeResponse.status !== 200) throw new GraphQLError("Error getting actual time")
      const data = await getTimeResponse.json()
      if (!data?.temp) throw new GraphQLError("Temperature not found!")
      return data.temp
    }
  }
};































// return await ctx.UserCollection.find({ _id: { $in: ids }}).toArray()