export const typeDefs = `#graphql
  # --- TYPES ---
  type User {
    id: ID!
    name: String!
    email: String!
    tier: String!
    avatar: String
  }

  type GarmentMeta {
    category: String
    colors: [String]
    season: String
  }

  type Asset {
    id: ID!
    filename: String!
    url: String
    thumbnailUrl: String
    mimeType: String!
    size: Int
    createdAt: String
    meta: GarmentMeta
  }

  type Project {
    id: ID!
    name: String!
    slug: String!
    status: String!
    description: String
    tags: [String]
    assetCount: Int
    lastActivityAt: String
    createdAt: String
    assets: [Asset!]!
  }

  type Invoice {
    invoiceId: String
    amountPaid: Int
    currency: String
    paidAt: String
    receiptUrl: String
  }

  type Subscription {
    id: ID!
    status: String!
    tier: String!
    interval: String!
    currentPeriodStart: String!
    currentPeriodEnd: String!
    cancelAtPeriodEnd: Boolean!
    canceledAt: String
    trialStart: String
    trialEnd: String
    recentInvoices: [Invoice]
  }

  # --- INPUTS ---
  input UpdateProfileInput {
    name: String
    avatar: String
    tier: String
  }

  input UpdateProjectInput {
    name: String
    description: String
    tags: [String]
    settings: String
  }

  input UpdateAssetInput {
    filename: String
    originalName: String
    meta: GarmentMetaInput
  }

  input GarmentMetaInput {
    category: String
    colors: [String]
    season: String
  }

  # --- QUERIES ---
  type Query {
    # User
    me: User
    users: [User!]!
    user(id: ID!): User

    # Projects
    myProjects: [Project!]!
    project(id: ID!): Project

    # Assets
    asset(id: ID!): Asset
    projectAssets(projectId: ID!): [Asset!]!

    # Subscriptions
    mySubscription: Subscription
    subscriptions: [Subscription!]!
  }

  # --- MUTATIONS ---
  type Mutation {
    # Projects
    createProject(name: String!, description: String): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Assets
    registerAsset(projectId: ID!, filename: String!, originalName: String!, storageKey: String!, mimeType: String!, size: Int!): Asset!
    updateAsset(id: ID!, input: UpdateAssetInput!): Asset!
    deleteAsset(id: ID!): Boolean!

    # User profile
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!

    # Subscriptions
    cancelSubscription: Subscription!

    # Admin
    deleteUser(id: ID!): Boolean!
  }
`;