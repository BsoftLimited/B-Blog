import 'bootstrap/dist/css/bootstrap.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './screens/home';
import Login from './screens/login';
import Error from './screens/error';
import { Posts } from './components/posts';

/*function App() {
    const userInfo: UserInfo = useSelector(getUserSelector);
    const posts: Map<string, Post[]> = Json.parse(useSelector(getPostSelector)); console.log(posts.keys);
    const dispatch = useDispatch();
    
    const init_scroll = () =>{
        if (state.top && (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80)) {
            setState(prev => {
                return  {...prev, top: false };
            });
        } else if(!state.top) {
            setState(prev => {
                return  {...prev, top: true };
            });
        }
    }
    
    useEffect(()=>{
        window.addEventListener("scroll", () =>init_scroll());
        init_scroll();
    },[]);

    const signin = () => dispatch(login({username: "Bsoft", password: "bobby247"}));
    const signout = () => dispatch(logout());

    const create = () =>{
        if(state.mode !== AppMode.create){
            setState(prev => {
                return  {...prev, mode: AppMode.create };
            });
        }
    }

    const home = () =>{
        if(state.mode !== AppMode.main){
            setState(prev => { return  {...prev, mode: AppMode.main };});
        }
    }

    let menus:string[] = [];
    posts.forEach((value, key)=>{
        if(key !== "Latest"){  menus.push(key); } 
    });

    return (
        
  );
}*/

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={(<Home /> )} />
                <Route path="/home" element={(<Home /> )} />

                <Route path="/post" element={(<Posts /> )} />
                <Route path="/post/:id" element={(<Posts /> )} />
                <Route path="/post/:option" element={(<Posts /> )} />
                <Route path="/post/:option/:id" element={(<Posts /> )} />

                <Route path="/login/:option" element={(<Login /> )} />

                <Route path="*" element={(<Error /> )} />
            </Routes>
        </BrowserRouter>);
}

export default App;