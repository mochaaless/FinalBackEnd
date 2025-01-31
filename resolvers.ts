import { Collection, ObjectId } from "mongodb";
import { ContactModel } from "./types.ts";
import { GraphQLError } from "graphql";


type ContactsContext = {
  ContactsCollection: Collection<ContactModel>
}

export const resolvers = {
  Query: {
    getContacts: async (_:unknown, __:unknown, ctx: ContactsContext): Promise<ContactModel[]> => {
      return await ctx.ContactsCollection.find({}).toArray()
    }
  },
  Mutation: {
    
  },
};
