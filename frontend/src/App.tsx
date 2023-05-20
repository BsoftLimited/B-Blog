import 'bootstrap/dist/css/bootstrap.css';

import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './screens/home';
import Signin from './screens/signin';
import Error from './screens/error';
import Posts from './screens/posts';

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route index element={(<Home /> )} />
                <Route path="/signin" element={(<Signin /> )} />

                <Route path='/posts/:id' element={(<Posts />)} />
                <Route path='/posts/:id/:option' element={(<Posts />)} />

                <Route path="*" element={(<Error /> )} />
            </Routes>
        </HashRouter>);
}

export default App;