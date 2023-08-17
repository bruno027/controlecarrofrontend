import axios from "axios";
import { parseCookies } from "nookies";
import {LoginTokenError} from './errors/LoginTokenError'

import {signOut} from '../contexts/user'

export function setupAPIClient(ctx = undefined){
    let cookies = parseCookies(ctx);

    const api = axios.create({
        //baseURL:'https://api.pladio.com.br',
        baseURL:'http://localhost:3333',
        headers:{
            Authorization:`Bearer ${cookies['@megalink.token']}`
        }
    })

    api.interceptors.response.use(response =>{
        return response;
    }, (error) => {
        if(error.response.status === 401){
            if(typeof window !== undefined){
                //deslogar usuario
                signOut();
            }else{
                return Promise.reject(new LoginTokenError())
            }
        }
        return Promise.reject(error);
    })

    return api;

}