import axios from 'axios';
import { apiUrl } from '@/constants/env';

export const api = axios.create({
	baseURL: apiUrl,
	headers: {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
	},
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status !== 401) {
      throw (error);
		}

    console.warn(error.message);

		window.location.reload();
	},
);

export default api;
