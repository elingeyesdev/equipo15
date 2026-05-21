const util = require('./dist/src/modules/admin/impersonation-token.util.js');
const t = util.createImpersonationToken({
  uid: 'impersonated-uid-2',
  email: 'company2@example.com',
  role: 'COMPANY',
  roleName: 'company',
  companyId: 'company-456',
  companyName: 'Beta LLC',
  originalAdminUid: 'admin-uid-2',
  originalAdminEmail: 'admin2@example.com',
});
console.log(t.token);
