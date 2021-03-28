import { GET, POST } from '@/api';
import apiInterface from 'api';

export const registerWhitelistList = (
  params?: apiInterface.RegisterWhitelistListQuery,
) => {
  return GET('/api/register-whitelist/list', {
    params,
  });
};

export const registerWhitelistAdd = (
  data?: apiInterface.RegisterWhitelistAddData,
) => {
  return POST('/api/register-whitelist/add', {
    data,
  });
};

export const registerWhitelistEdit = (
  data?: apiInterface.RegisterWhitelistEditData,
) => {
  return POST('/api/register-whitelist/update', {
    data,
  });
};

export const registerWhitelistDelete = (
  data?: apiInterface.RegisterWhitelistDeleteData,
) => {
  return POST('/api/register-whitelist/delete', {
    data,
  });
};

export const registerWhitelistBatchEdit = (
  data?: apiInterface.RegisterWhitelistBatchEditData,
) => {
  return POST('/api/register-whitelist/batch-update', {
    data,
  });
};
