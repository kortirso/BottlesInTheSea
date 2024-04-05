import {validateResponse} from '../helpers/response';

const fetchAllWorldCells = async worldId => {
  try {
    const responseIncludeFields = 'id,name,q,r,surface';
    const response = await fetch(
      `http://localhost:5000/api/v1/cells?world_id=${worldId}&response_include_fields=${responseIncludeFields}`,
      {
        method: 'GET',
      },
    );

    validateResponse(response);
    const jsonResponse = await response.json();
    return jsonResponse.cells.data.map(element => element.attributes);
  } catch (error) {
    if (error.name === 'AuthError') {
      throw error;
    }

    return [];
  }
};

export {fetchAllWorldCells};
