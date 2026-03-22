import { gql } from '@apollo/client/core';

// Projects
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $description: String) {
    createProject(name: $name, description: $description) { id name slug status }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) { id name slug status description tags }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

// Assets
export const REGISTER_ASSET = gql`
  mutation RegisterAsset($projectId: ID!, $filename: String!, $originalName: String!, $storageKey: String!, $mimeType: String!, $size: Int!) {
    registerAsset(projectId: $projectId, filename: $filename, originalName: $originalName, storageKey: $storageKey, mimeType: $mimeType, size: $size) {
      id filename mimeType url
    }
  }
`;

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($id: ID!, $input: UpdateAssetInput!) {
    updateAsset(id: $id, input: $input) { id filename meta { category colors season } }
  }
`;

export const DELETE_ASSET = gql`
  mutation DeleteAsset($id: ID!) {
    deleteAsset(id: $id)
  }
`;

// User profile
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id name email tier avatar }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

// Subscriptions
export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription {
    cancelSubscription { id status cancelAtPeriodEnd }
  }
`;

// Admin
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;