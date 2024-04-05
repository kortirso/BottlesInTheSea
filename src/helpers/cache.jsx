import AsyncStorage from '@react-native-async-storage/async-storage';

const refreshCache = async (cacheKey, expirationTime, fetchFunction) => {
  const result = await fetchFunction();

  const jsonValue = JSON.stringify({
    data: result,
    expires_at: Date.now() + expirationTime,
  });
  await AsyncStorage.setItem(cacheKey, jsonValue);

  return result;
};

const fetchFromCache = async (
  useCache,
  cacheKey,
  expirationTime,
  fetchFunction,
) => {
  // if no using cache
  if (!useCache) {
    return refreshCache(cacheKey, expirationTime, fetchFunction);
  }

  const jsonValue = await AsyncStorage.getItem(cacheKey);
  const parsedJsonValue = jsonValue != null ? JSON.parse(jsonValue) : null;

  // if not expired -> return data from cache
  if (parsedJsonValue && parsedJsonValue.expires_at > Date.now()) {
    return parsedJsonValue.data;
  }

  // if cache is expired or no value in cache
  return refreshCache(cacheKey, expirationTime, fetchFunction);
};

export {fetchFromCache};
