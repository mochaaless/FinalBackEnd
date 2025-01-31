export const schema = `#graphql

  type Contact {
    id: ID!
    name: String!
    phone: String!
    country: String!
    time: String!
    friends: [Contact!]!
    numberOfFriends: Int!
  }


  type Query {
    getContacts: [Contact!]!
  }

  type Mutation {
    addContact(name: String!, phone: String!) : Contact!
  }
`;
