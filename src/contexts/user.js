import { useState, createContext } from "react";

import {api} from '../services/apiClient'

import {destroyCookie, setCookie,parseCookies} from 'nookies'


 
export const UserContext = createContext({});

export function signOut(){
    try{
        destroyCookie(undefined, '@megalink.token')
        navigator('/')
    }catch{
        console.log('error ao deslogar')
    }
}


 function UserProvider({children}){
    let userInteface = {
        id:0,
        nome:'',
        email:'',

      }
    const [funcionario,setFuncionario] = useState([userInteface])

    async function login({email,senha}){
        try{
            const response = await api.post('/entrar', {
                email,
                senha
            })

            console.log(response.data)
            const {id,nome, token} = response.data;
            setCookie(undefined,'@megalink.token',token, {
                maxAge: 999*999*999*999,
                path:"/"
            })

            setFuncionario({
               id:id,
               nome:nome,
               email:email 
            })
            

            api.defaults.headers['Authorization'] = `Bearer ${token}`
            window.location.href = '/'

        }catch(err){
            console.log("erro ao acessar",err)
        }
    }

    return(
        <UserContext.Provider value={{login}}>
            {children}
        </UserContext.Provider>

    )
}
export default UserProvider