import { Random } from 'mockjs';
import base, { user, userLogin } from './base';

export default {
  'GET /api/user/search': base('data|1-3', [user]),
  'GET /api/user/list': base('data|1-10', [user]),
  'POST /api/user/admin-add': base('data', user),
  'POST /api/user/admin-update': base('data', user),
  'POST /api/user/delete': base('data', {}),
  'POST /api/user/admin-login': base('data', userLogin),
};
