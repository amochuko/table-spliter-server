export type AuthUser ={
    id:string;
    email?:string;
    username?:string;
    role?: 'user' | 'admin'
}
