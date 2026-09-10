/**
 * Helper utility functions
 */

const isValidEmailDomain = (email, allowedDomains = []) => {
  if (!allowedDomains || allowedDomains.length === 0) return true;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return allowedDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
};

const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.passwordHash;
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = {
  isValidEmailDomain,
  sanitizeUser
};
