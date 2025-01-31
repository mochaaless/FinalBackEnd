export const schema = `#graphql

  type Restaurant {
    id: ID!
    name: String!
    address: String!
    phone: String!
    temperature: String
    time: String!
  }


  type Query {
    getRestaurants(city: String!) : [Restaurant!]!
    getRestaurant(id: ID!) : Restaurant!
  }

  type Mutation {
    addRestaturant(name: String!, address: String!, city: String!, phone: String!) : Restaurant!
    deleteRestaurant(id: ID!) : Boolean!
  }
`;
