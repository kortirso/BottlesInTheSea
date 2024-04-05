import {validateResponse} from '../helpers/response';

const fetchAllWorlds = async () => {
  try {
    const responseIncludeFields = 'id,name,map_size,ticks';
    const response = await fetch(
      `http://localhost:5000/api/v1/worlds?response_include_fields=${responseIncludeFields}`,
      {
        method: 'GET',
      },
    );

    validateResponse(response);
    const jsonResponse = await response.json();
    return jsonResponse.worlds.data.map(element => element.attributes);
  } catch (error) {
    if (error.name === 'AuthError') {
      throw error;
    }

    return [];
  }
};

export {fetchAllWorlds};
