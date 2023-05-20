import { Button, Col, Container, Form, Row } from "react-bootstrap";
import Header from "../components/header";
import React, { useState } from "react";
import "../assets/styles/signin.css";
import { LoginRequest, SignUpRequest } from "../utils/requests";
import { useAppDispatch } from "../utils/store";
import { loginAsync } from "../items/user";
import { useNavigate } from "react-router-dom";


const Signin = () =>{
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [login,  setLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loginDetails, setLoginDetails] = useState<LoginRequest>({email: "", password: ""});
    const [signupDetails, setSignupDetails] = useState<SignUpRequest>({name:"", surname: "", email: "", passowrd: "", repassword: ""})

    const openLoginForm = () => setLogin(true);
    const openSignupForm = () => setLogin(false);

    const loginChange = (event: React.ChangeEvent<HTMLInputElement>) =>{
        let input = event.currentTarget;
        switch(input.id){
            case "loginEmail":
                setLoginDetails({...loginDetails, email: input.value});
                break;
            case "loginPassword":
                setLoginDetails({...loginDetails, password: input.value});
                break;
        }
    }

    const signupChange = (event: React.ChangeEvent<HTMLInputElement>) =>{

    }

    const handleSubmit = (event: React.UIEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();
        
        if(form.id === "login"){
            console.log(JSON.stringify(loginDetails))
            dispatch(loginAsync(loginDetails, 
                ()=>{ setLoading(true); }, 
                ()=>{ setLoading(false); navigate("/"); }, 
                (error: any)=>{ setLoading(false); alert(error.message);
            }));
        }
    };

    return (
        <div>
            <Header parent="login" />
            <Row className='content'>
                <Col lg={6} className="content-container">
                    <h2 className='content-header'>B-Blog</h2>
                    <p className='content-item'>
                        Baptême de tabarnane de cimonaque d'étole de patente à gosse de maudit de cossin de colon de cibouleau de saint-ciboire.
                        Cul de bout d'ciarge de Jésus Marie Joseph de câlique de colon de câline de sacréfice de mosus de batèche d'étole.
                        Saintes fesses d'ostie de sapristi de mosus de boswell de baptême de torrieux de caltor de purée de crucifix.
                        Verrat de viande à chien de calvince de gériboire de cibouleau de calvinouche de bâtard de christie de crucifix de doux Jésus.
                        Saintes fesses de Jésus Marie Joseph de sacristi de ciboire de charogne d'enfant d'chienne de bâtard de cul de mosus de saint-ciboire.
                    </p>
                </Col>
                <Col lg={6} style={{justifyContent:"center"}}>
                    <div className='forms shadow'>
                        <Row style={{marginBottom: "30px"}}>
                            <Col sm={6} className='pe-1'>
                                <Button className={ login ? "form-btn options-btn" : "form-btn-outline options-btn" } variant="primary" onClick={openLoginForm}>Login</Button>
                            </Col>
                            <Col sm={6} className='ps-1'>
                                <Button className={ login ?  "form-btn-outline options-btn" : "form-btn options-btn" } variant="primary" onClick={openSignupForm}>Sign Up</Button>
                            </Col>
                        </Row>

                        {login && 
                            (<Form className="slidin" id="login" onSubmit={handleSubmit}>
                                <Form.Group controlId="loginEmail">
                                    <Form.Label className="form-label">Email</Form.Label>
                                    <Form.Control className="form-input" onChange={loginChange} required type="email" placeholder='Enter your Email'/>
                                </Form.Group>
                                <Form.Group controlId="loginPassword">
                                    <Form.Label className="form-label">Password</Form.Label>
                                    <Form.Control className="form-input" onChange={loginChange} required type="password" placeholder="Enter your Password" />
                                </Form.Group>
                                <Button className='options-btn form-btn' variant="light" type="submit">Login</Button>
                            </Form>) 
                        }
                        { !login  && 
                            (<Form className="slidin form" id="signup" onSubmit={handleSubmit}>
                                <Form.Group>
                                    <Form.Label className="form-label">Name</Form.Label>
                                    <Form.Control className="form-input" required type="text" placeholder='Enter your name'/>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="form-label">Surname</Form.Label>
                                    <Form.Control className="form-input" required type="text" placeholder='Enter your surname'/>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="form-label">Email</Form.Label>
                                    <Form.Control className="form-input" required type="email" placeholder='Enter your Email'/>
                                </Form.Group>
                                <Form.Group className="mb-4" style={{textAlign: 'left'}}  controlId="password">
                                    <Form.Label className="form-label">Password</Form.Label>
                                    <Form.Control className="form-input" required type="password" placeholder="Enter your Password" />
                                </Form.Group>
                                <Form.Group className="mb-4" style={{textAlign: 'left'}}  controlId="repassword">
                                    <Form.Label className="form-label">Confirm Password</Form.Label>
                                    <Form.Control className="form-input" required type="password" placeholder="Confirm your Password" />
                                </Form.Group>
                                <Button className='options-btn form-btn' variant="light" type="submit">Submit</Button>
                            </Form>)
                        }
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default Signin;