export const login = async (email: string, password: string) => {
  return { success: true, token: 'fake-token', role: 'admin' };
};
