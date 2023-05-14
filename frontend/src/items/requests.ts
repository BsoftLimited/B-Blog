interface SignUpRequest{
    name: string, surname: string, email:string, passowrd: string
}

interface LoginRequest{
    email: string, password: string
}

interface InterestsAddRequest{
    interests: string[]
}

export type { SignUpRequest, LoginRequest, InterestsAddRequest }