import React, {useContext, useState} from 'react';
import './Login.css';
import {UserContext} from '../../contexts/user'


const LoginForm = () => {
    const [email,setEmail] = useState([]);
    const [senha, setSenha] = useState([]);
    const {login} = useContext(UserContext);



    async function entrar(){
        
        let data={
            email,
            senha
        }

        await login(data)

    }

    
    

  

  return (
    <div>
    <br/><br/><br/><br/><br/><br/><br/>
    <div className="login-form-container">
        
      <h2>Login</h2>
      <form >
        <input
          type="text"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button type="button" onClick={()=>entrar(email,senha)}>Login</button>
      </form>
    </div>
    </div>
  );
};

export default LoginForm;
