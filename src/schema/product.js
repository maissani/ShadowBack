import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    products(cursor: String, limit: Int): ProductConnection!
    product(id: ID!): Product!
  }
  extend type Mutation {
    createProduct(text: String!): Product!
    deleteProduct(id: ID!): Boolean!
  }
  type ProductConnection {
    edges: [Product!]!
    pageInfo: PageInfo!
  }
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    createdAt: Date!
    user: User!
  }
  extend type Subscription {
    productCreated: ProductCreated!
  }
  type ProductCreated {
    product: Product!
  }
`;