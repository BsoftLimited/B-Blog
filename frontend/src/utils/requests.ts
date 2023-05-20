interface SignUpRequest{
    name: string, surname: string, email:string, passowrd: string, repassword: string
}

interface LoginRequest{
    email: string, password: string
}

interface PostCreateRequest{
    title : string,
    message : string,
    categories : string[]
}

interface InterestCreateRequest{
    interests: string[]
}

export type { SignUpRequest, LoginRequest, PostCreateRequest, InterestCreateRequest }