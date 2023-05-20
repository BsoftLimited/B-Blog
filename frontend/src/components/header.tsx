import { Container, Nav, Navbar, NavbarBrand, NavDropdown } from "react-bootstrap";
import { BiBell, BiCog, BiDumbbell, BiNotification } from "react-icons/bi";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserSelector, useAppDispatch } from "../utils/store";

import profile from '../assets/images/profile.png';
import user, { initAccountAsync, logoutAsync, UserState } from "../items/user";
import { useEffect, useState } from "react";
import "../assets/styles/header.css";

const Header = (props: { parent: string}) =>{
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const userState: UserState = useSelector(getUserSelector);
    const [hasSignedOut, setHasSignedOut] = useState(false);

    useEffect(()=>{
        if(!userState.user && !hasSignedOut){
            dispatch(initAccountAsync());
        } 
    }, [hasSignedOut]);

    const menus: string[] = ["Categories"];

    const toHome = () =>{
        if(props.parent !== "home"){
            navigate("/home");
        }
    }

    const signout = () =>{
        setHasSignedOut(true);
        dispatch(logoutAsync((error: any)=>{ alert(error); }));
    }

    return (
        <Navbar className={"navbar-light sticky-top text-blue bg-blue shadow"} id="navbar" style={{paddingBottom:"0px",  paddingTop:"0px"}}>
            <Container fluid className="px-md-3 px-lg-5">
                <NavbarBrand>B-Blog</NavbarBrand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link className="text-light" as={Link} to={"/"} style={{borderTop:"solid 3px white", borderBottom:"solid 3px white", padding: "18px"}}>Home</Nav.Link>
                        { menus.map(menu => (
                            <Nav.Link className="text-light" as={Link} to={menu} style={{borderTop:"solid 4px transparent", borderBottom:"solid 4px transparent", padding: "18px"}}>{menu}</Nav.Link>
                        )) }
                    </Nav>
                    <Nav className="navbar-end align-right">
                        { userState.user && (<Nav.Item>
                            <img className="rounded-circle me-1 border bg-white" src={profile} width="45" height="45"/>
                            <span className="text-white"> Hi {userState.user.name}</span>
                        </Nav.Item>) }

                        { userState.user && (<NavDropdown title={(<BiBell size={24} className="text-light"/>)} id="nav-dropdown-notifications">
                           
                        </NavDropdown>) }

                        { userState.user && (<NavDropdown title={(<BiCog size={24} className="text-light"/>)} id="nav-dropdown-settings">
                            <NavDropdown.Item eventKey="4.1" style={{fontSize: "12px"}}>Create</NavDropdown.Item>
                            <NavDropdown.Item eventKey="4.2" style={{fontSize: "12px"}}>Settings</NavDropdown.Item>  
                            <NavDropdown.Divider />  
                            <NavDropdown.Item eventKey="4.4" style={{fontSize: "12px"}} onClick={signout}>Signout</NavDropdown.Item>
                        </NavDropdown>) }
                        
                        { !userState.user && (<Nav.Item>
                            <Nav.Link className="text-light" as={Link} to={"/signin"}>Signin</Nav.Link>
                        </Nav.Item>) }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;