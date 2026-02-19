let token: string | null = null;

export const setToken = (value: string) => {
  token = value;
};

export const getToken = () => {
  if (!token) {
    throw new Error(
      "Token has not been set yet. Did you forget to call cy.login()?",
    );
  }
  return token;
};
