import { Col, Container, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Header from "../components/header";
import Loading from "../components/loading";
import { ViewPostResponse } from "../utils/response";
import { useEffect, useState } from "react";
import { initSinglePostsAsync } from "../items/post";
import Footer from "../components/footer";
import Latest from "../components/latest";

const Posts = () =>{
    const params = useParams();
    let [posts, setPosts] = useState<ViewPostResponse | undefined>(undefined);
    
    useEffect(()=>{
        initSinglePostsAsync(params.id!).then((value: ViewPostResponse)=>{
            setPosts(value);
        }).catch((error) =>{
            alert(error);
        });
    }, []);
    
    return (
        <div>
            <Header parent="post" />
            <div className="mt-5">
                { !posts && (<Loading />)}
                { posts && 
                    (<Container fluid={true} className="px-md-3 px-lg-5">
                        <Row>
                            <Col lg={9}>
                                <h3>{ posts.main.title }</h3>
                            </Col>
                            <Col lg={3}>
                                <div className="border px-3 pb-3 mb-4" id="latests" style={{ borderRadius:"8px" }}>
                                    <h5 className="text-blue mt-3 latest">Latest Posts</h5>
                                    <Latest posts={posts.latest} />
                                </div>
                            </Col>
                        </Row>  
                    </Container>)
                }
            </div>
            <Footer />
        </div>
    );
}

export default Posts;