import Footer from "../components/footer";
import Header from "../components/header";
import '../assets/styles/main.css';
import { initPostsAsync } from "../items/post";
import { Button, Col, Container, Form } from "react-bootstrap";
import { Row } from "react-bootstrap";
import { useEffect, useState } from 'react';
import { HomePageResponse } from '../utils/response';
import { UserState } from '../items/user';
import { useSelector } from 'react-redux';
import { getUserSelector } from '../utils/store';
import Loading from "../components/loading";
import Cards from "../components/cards";
import Latest from "../components/latest";

/*const Home = () =>{
    return (
        <div>
            <Header top={false} />
            <div className="title-bg section image image-responsive" id="home">
                <div className="jumbotron text-white text-center">
                    <h1 className="title">B-Blog</h1>
                    <p>share your opions we the world</p>
                </div>
            </div>
            <Main />
            <Footer />
        </div>
    );
}*/

const Home = () =>{
    const userState: UserState = useSelector(getUserSelector);
    let [posts, setPosts] = useState<HomePageResponse | undefined>(undefined);
    
    useEffect(()=>{
        initPostsAsync().then((value: HomePageResponse)=>{
            setPosts(value);
        }).catch((error) =>{
            alert(error);
        });
    }, [userState.user]);

    return (
        <div>
            <Header parent="home" />
            <div className="mt-5">
                { !posts && (<Loading />)}
                { posts && 
                    (<Container fluid={true} className="px-md-3 px-lg-5">
                        <div className="section image image-responsive">
                            <div className="jumbotron text-center" style={{color: "grey"}}>
                                <h1 className="title">B-Blog</h1>
                                <p>share your opions we the world</p>
                                <div style={{ textAlign: "end" }}>
                                    <Form>
                                        <Form.Control  className='me-2' placeholder='search posts' id='search' required style={{display: "inline", maxWidth: "300px"}}/>
                                        <Button className='button-blue' variant='primary' type="submit">search</Button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <Row>
                            <Col lg={9}>
                                <h5 className="text-blue mt-2 latest mb-3">For you</h5>
                                <Cards posts={posts.recommendations } />
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

export default Home;