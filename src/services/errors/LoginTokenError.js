export class LoginTokenError extends Error{
    constructor(){
        super('Erro de autenticação')
    }
}