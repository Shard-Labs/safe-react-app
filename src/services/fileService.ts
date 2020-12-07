import { SERVER_URL, CHAIN_ID } from '../constans';
import axios from 'axios';

/**
 * CONTRACT ADDRESS EXAMPLES
 * 0x00108a984a2577c8923FFd93aB1D33De5E9095a6
 * 0x00000000219ab540356cBB839Cbe05303d7705Fa
 * */

export const fetchFiles = async (contractAddress: string) => {
  let response: any;

  try {
    response = await axios.get(`${SERVER_URL}/files/${CHAIN_ID}/${contractAddress}`);
  } catch (err) {
    response = err.response;
  }

  return response;
};
