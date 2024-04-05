const createUser = async (username, password, passwordConfirmation) => {
  try {
    const response = await fetch(
      'localhost:5000/api/v1/users?response_include_fields=username,access_token,locale',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            username: username,
            password: password,
            password_confirmation: passwordConfirmation,
          },
        }),
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

const updateUser = async (accessToken, params) => {
  try {
    const response = await fetch(
      `localhost:5000/api/v1/users?response_include_fields=locale&api_access_token=${accessToken}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: params,
        }),
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

const destroyUser = async accessToken => {
  try {
    const response = await fetch(
      `localhost:5000/api/v1/users?api_access_token=${accessToken}`,
      {
        method: 'DELETE',
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

const getAccessToken = async (email, password) => {
  try {
    const response = await fetch(
      'localhost:5000/api/v1/users/access_tokens?response_include_fields=username,access_token,locale',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email: email,
            password: password,
          },
        }),
      },
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }
};

export {createUser, updateUser, destroyUser, getAccessToken};
