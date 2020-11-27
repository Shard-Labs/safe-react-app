import { SERVER_URL } from './constans';
import axios from 'axios';

const CHAIN = 1;
export const CONTRACT_ADDRESS = `0x00108a984a2577c8923FFd93aB1D33De5E9095a6`;
// export const CONTRACT_ADDRESS = `0x00000000219ab540356cBB839Cbe05303d7705Fa`;

export const fetchFiles = async () => {
  let response: any;

  try {
    response = await axios.get(`${SERVER_URL}/files/${CHAIN}/${CONTRACT_ADDRESS}`);
  } catch (err) {
    response = err.response;
  }

  return response;
};
