import Footer from "../components/footer";
import Header from "../components/header";
import { Main } from "../components/main";

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
    return (
        <div>
            <Header top={true} />
        </div>
    );
}

export default Home;