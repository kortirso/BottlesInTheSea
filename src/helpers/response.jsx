class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const validateResponse = response => {
  if (response.status === 401) {
    throw new AuthError('Unauthorized');
  }
  if (response.status === 403) {
    throw new AuthError('Forbidden');
  }
};

export {validateResponse};
