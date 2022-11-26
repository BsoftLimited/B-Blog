import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {Container , Dropdown, Nav, NavDropdown} from 'react-bootstrap';  
import { Main } from './components/main';
import { login, logout, UserInfo } from './items/user';
import { useDispatch, useSelector } from 'react-redux';
import { getPostSelector, getUserSelector } from './utils/store';
import { Create } from './components/create';
import profile from './assets/images/profile.png';
import { Post } from './items/post';
import { Footer } from './components/footer';
import { Json } from './utils/util';
import { BiCog } from 'react-icons/bi';

enum AppMode{ main, create }

interface AppState{
  mode: AppMode,
  top: boolean
}

function App() {
    const[state, setState] = useState<AppState>({mode: AppMode.main, top: true});
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
        if(state.mode != AppMode.create){
            setState(prev => {
                return  {...prev, mode: AppMode.create };
            });
        }
    }

    const home = () =>{
        if(state.mode != AppMode.main){
            setState(prev => { return  {...prev, mode: AppMode.main };});
        }
    }

    let menus:string[] = [];
    posts.forEach((value, key)=>{
        if(key !== "Latest"){  menus.push(key); } 
    });

    return (
        <div className="App">
            <header> 
                <nav className={"navbar navbar-expand-lg navbar-light text-blue fixed-top" + (state.top ? "" : " navbar-bg-grey shadow")} id="navbar">
                    <div className="container">
                        <a className="navbar-brand">B-Blog</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse navbar-center" id="navbarCollapse">
                            <ul className="navbar-nav nav-pills me-auto mb-2 mb-md-0" id="menu-list">
                                <li className={"nav-item" + (state.mode === AppMode.main && " active") }><a className="nav-link" type='button' onClick={home}>Home</a></li>
                                    { menus.map(menu => (<li className="nav-item"><a className="nav-link" type='button'>{menu}</a></li>)) }
                            </ul>

                            { userInfo.active &&
                                (<ul id="options-image" className="navbar-nav navbar-end nav-pills align-right flex-clomn">
                                    <li className="nav-item"><label className="nav-link">
                                        <img className="rounded-circle me-1 border bg-white" src={profile} width="45" height="45"/>
                                        <span id="name" className="text-white"></span>
                                    </label></li>
                                </ul>)
                            }
                            
                            { userInfo.active &&  
                                (<ul id = "options-default" className="navbar-nav navbar-end nav-pills align-right flex-clomn">
                                    <li className="nav-item"><a className="nav-link" type='button'>{"Hi," + userInfo.user?.username}</a></li>
                                </ul>) 
                            }

                            { userInfo.active ?  
                                (<Nav as="ul" > 
                                    <NavDropdown title={(<BiCog size={24} className="text-light"/>)} id="nav-dropdown">
                                        <NavDropdown.Item className="DropdownItem" eventKey="4.1" onClick={create}>Create</NavDropdown.Item>
                                        <NavDropdown.Item className="DropdownItem" eventKey="4.2">Settings</NavDropdown.Item>  
                                        <NavDropdown.Divider />  
                                        <NavDropdown.Item className="DropdownItem" eventKey="4.4" onClick={signout}>Signout</NavDropdown.Item>
                                    </NavDropdown>
                                </Nav> )
                                :
                                (<ul id = "options-default" className="navbar-nav navbar-end nav-pills align-right flex-clomn">
                                    <li className="nav-item"><a className="nav-link" type='button' onClick={signin}>Sign in</a></li>
                                </ul>)
                            }
                        </div>
                    </div>
                </nav>
            </header>
            <div className="title-bg section image image-responsive" id="home">
                <div className="jumbotron text-white text-center">
                    <h1 className="title">B-Blog</h1>
                    <p>share your opions we the world</p>
                </div>
            </div>
            { state.mode == AppMode.main ? <Main /> : <Create /> }
            <Footer />
        </div>
  );
}

export default App;