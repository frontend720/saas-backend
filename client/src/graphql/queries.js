import { gql } from '@apollo/client/core';

// User
export const ME = gql`
  query Me {
    me { id name email tier avatar }
  }
`;

export const USERS = gql`
  query Users {
    users { id name email tier avatar }
  }
`;

export const USER = gql`
  query User($id: ID!) {
    user(id: $id) { id name email tier avatar }
  }
`;

// Projects
export const MY_PROJECTS = gql`
  query MyProjects {
    myProjects { id name slug status description tags assetCount }
  }
`;

export const PROJECT = gql`
  query Project($id: ID!) {
    project(id: $id) {
      id name slug status description tags assetCount
      assets { id filename mimeType url thumbnailUrl }
    }
  }
`;

// Assets
export const ASSET = gql`
  query Asset($id: ID!) {
    asset(id: $id) {
      id filename mimeType url thumbnailUrl
      meta { category colors season }
    }
  }
`;

export const PROJECT_ASSETS = gql`
  query ProjectAssets($projectId: ID!) {
    projectAssets(projectId: $projectId) {
      id filename mimeType size url thumbnailUrl
    }
  }
`;

// Subscriptions
export const MY_SUBSCRIPTION = gql`
  query MySubscription {
    mySubscription {
      id status tier interval
      currentPeriodStart currentPeriodEnd
      cancelAtPeriodEnd canceledAt
      recentInvoices { invoiceId amountPaid currency paidAt receiptUrl }
    }
  }
`;

export const SUBSCRIPTIONS = gql`
  query Subscriptions {
    subscriptions {
      id status tier interval currentPeriodEnd cancelAtPeriodEnd
    }
  }
`;