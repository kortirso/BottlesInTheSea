import React, {useState, useEffect, createContext, useContext} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const ACCESS_TOKEN_STORAGE_NAME = 'access_token';
const AUTH_DATA_STORAGE_NAME = 'auth_data';

const initialState = {
  accessToken: undefined,
  username: undefined,
  locale: 'en',
};

function useAuth() {
  return useContext(AuthContext);
}

const AuthProvider = ({children}) => {
  const [authState, setAuthState] = useState(initialState);

  // Get current access token from EncryptedStorage
  const getAccessToken = async () => {
    try {
      // read encrypted storage
      const accessToken = await EncryptedStorage.getItem(
        ACCESS_TOKEN_STORAGE_NAME,
      );
      // read simple storage
      const jsonValue = await AsyncStorage.getItem(AUTH_DATA_STORAGE_NAME);
      const parsedJsonValue = jsonValue != null ? JSON.parse(jsonValue) : null;
      setAuthState({
        accessToken: accessToken,
        username: parsedJsonValue.username,
        locale: parsedJsonValue.locale,
      });
    } catch (err) {}
  };

  // set access token to EncryptedStorage
  const updateAuthState = async response => {
    try {
      // encrypted storage for access_token
      await EncryptedStorage.setItem(
        ACCESS_TOKEN_STORAGE_NAME,
        response.access_token,
      );
      // simple storage for simple data
      const jsonValue = JSON.stringify({
        username: response.username,
        locale: response.locale,
      });
      await AsyncStorage.setItem(AUTH_DATA_STORAGE_NAME, jsonValue);
      setAuthState({
        accessToken: response.access_token,
        username: response.username,
        locale: response.locale,
      });
    } catch (error) {}
  };

  // set access token to EncryptedStorage
  const updateParamsAuthState = async params => {
    try {
      // simple storage for simple data
      const jsonValue = JSON.stringify(params);
      await AsyncStorage.setItem(AUTH_DATA_STORAGE_NAME, jsonValue);
      setAuthState({...authState, ...params});
    } catch (error) {}
  };

  // remove access token from EncryptedStorage
  const clearAuthState = async () => {
    try {
      // clear storages
      await EncryptedStorage.removeItem(ACCESS_TOKEN_STORAGE_NAME);
      await AsyncStorage.removeItem(AUTH_DATA_STORAGE_NAME);
      setAuthState(initialState);
    } catch (error) {}
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        updateAuthState,
        updateParamsAuthState,
        clearAuthState,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthProvider, useAuth};
