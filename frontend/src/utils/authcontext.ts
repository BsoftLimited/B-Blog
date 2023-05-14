import axios from 'axios';
import Util from './util';

const axiosInstance =  axios.create({
	//headers: {"Access-Control-Allow-Origin": "*"},
	headers: { 
		'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true',
		'Content-Type': 'application/x-www-form-urlencoded' 
	},
	withCredentials: true, 
	baseURL: Util.HomeUrl, }); /// server host

export { axiosInstance }