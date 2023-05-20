import { Post, SinglePost } from "../items/post";

interface ErrorResponse{
    message: string;
}

interface HomePageResponse{
    recommendations: Post[],
    latest: Post[]
}

interface ViewPostResponse{
    latest: Post[],
    main: SinglePost,
    similar:  Post[]
}

interface CategoryPostsResponse{
    posts: Post[],
    latest: Post[]
}

export type{ ErrorResponse, HomePageResponse, ViewPostResponse, CategoryPostsResponse };