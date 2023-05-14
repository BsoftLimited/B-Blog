import { create } from "domain";
import { Container, Nav, Navbar, NavbarBrand, NavDropdown } from "react-bootstrap";
import { BiCog } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { UserInfo, UserState } from "../items/user";
import { getUserSelector } from "../utils/store";

import profile from '../assets/images/profile.png';

const Header = (props: { top: boolean, parent: string}) =>{
    const params = useParams();
    const navigate = useNavigate();
    const userState: UserState = useSelector(getUserSelector);

    const menus: string[] = [];

    const toHome = () =>{
        if(props.parent !== "home"){
            navigate("/home");
        }
    }
    const signin = () =>{
        if(props.parent !== "signin"){
            navigate("/signin/login");
        }
    }
    const signout = () =>{
        
    }

    return (
        <Navbar className={"navbar-light text-blue fixed-top" + (props.top ? "" : " navbar-bg-grey shadow")} id="navbar">
            <Container>
                <NavbarBrand>B-Blog</NavbarBrand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link onClick={ toHome}>Home</Nav.Link>
                        { menus.map(menu => (<Nav.Link onClick={ toHome}>menus</Nav.Link>)) }
                    </Nav>

                    { userInfo.active ?  
                        (<Nav className="navbar-end align-right">
                            <Nav.Item>
                                <img className="rounded-circle me-1 border bg-white" src={profile} width="45" height="45"/>
                                <span className="text-white"> Hi {userInfo.user?.name }</span>
                            </Nav.Item>
                            <NavDropdown title={(<BiCog size={24} className="text-light"/>)} id="nav-dropdown">
                                <NavDropdown.Item eventKey="4.1" onClick={create}>Create</NavDropdown.Item>
                                <NavDropdown.Item eventKey="4.2">Settings</NavDropdown.Item>  
                                <NavDropdown.Divider />  
                                <NavDropdown.Item eventKey="4.4" onClick={signout}>Signout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>):
                        (<Nav className="navbar-end align-right">
                            <NavDropdown.Item onClick={signin}>Sign in</NavDropdown.Item>
                        </Nav>)
                    }
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;