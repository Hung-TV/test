export function resolveIsAdmin(user) {
  const roles = user?.roles || [];

  return roles.some((role) => {
    const name = typeof role === 'string' ? role : role?.name;
    return name === 'ADMIN' || name === 'ROLE_ADMIN';
  });
}
