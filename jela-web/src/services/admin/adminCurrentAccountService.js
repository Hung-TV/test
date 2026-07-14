import authApi from '../../api/authApi';
import userApi from '../../api/userApi';

const getResponsePayload = (response) =>
  response?.data?.user ||
  response?.data ||
  response?.user ||
  response ||
  {};

export const normalizeCurrentAccount = (account = {}) => ({
  ...account,
  fullName: account.fullName || account.name || '',
  phoneNumber: account.phoneNumber || account.phone || '',
  avatarUrl:
    account.avatarUrl || account.avatar || account.picture || '',
  createdAt: account.createdAt || account.registeredAt || null,
  updatedAt: account.profileUpdatedAt || account.updatedAt || null,
  lastLoginAt: account.lastLoginAt || account.lastLogin || null,
});

export async function getCurrentAccount() {
  const response = await userApi.getCurrentUser();
  return normalizeCurrentAccount(getResponsePayload(response));
}

export async function updateCurrentAccount(payload) {
  const response = await userApi.updateProfile(payload);
  return normalizeCurrentAccount(getResponsePayload(response));
}

export function changeCurrentPassword(payload) {
  return authApi.changePassword(payload);
}

export async function updateCurrentEmail(email) {
  const response = await userApi.updateEmail(email);
  return getResponsePayload(response);
}

export function sendCurrentEmailVerification() {
  return userApi.sendVerificationEmail();
}

const adminCurrentAccountService = {
  getCurrentAccount,
  updateCurrentAccount,
  changeCurrentPassword,
  updateCurrentEmail,
  sendCurrentEmailVerification,
};

export default adminCurrentAccountService;
