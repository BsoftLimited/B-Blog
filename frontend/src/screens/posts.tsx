import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";

const Posts = () =>{
    const params = useParams<{option?:string, id?:string}>();
    
    return (
        <Container>
            Post
        </Container>);
}

export default Posts;