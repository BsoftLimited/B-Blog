import { Container, Row, Col, Table } from "react-bootstrap";
import "../assets/styles/footer.css";

const Footer = () =>{
    return (
        <Container fluid={true} className="px-md-3 px-lg-5 bg-light pb-3">
            <div className="section mt-3" id="Contacts">
                <Row>
                    <Col md={6}>
                        <Table>
                            <tbody>
                                <tr><th className="text-blue"  style={{borderBottomWidth: "0px"}}>Quick Links</th></tr>
                                <tr>
                                    <td style={{borderBottomWidth: "0px"}}><a>Latest Event</a></td>
                                    <td style={{borderBottomWidth: "0px"}}><a>Terms and Conditions</a></td>
                                </tr>
                                <tr>
                                    <td style={{borderBottomWidth: "0px"}}><a>Privacy policy</a></td>
                                    <td style={{borderBottomWidth: "0px"}}><a>Contact us</a></td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                    <Col md={6}>
                        <Table>
                            <tbody>
                                <tr><th style={{borderBottomWidth: "0px"}} className="text-blue">Contacts</th></tr>
                                <tr>
                                    <td style={{borderBottomWidth: "0px"}}>Bsoftlimited@gmail.com</td>
                                    <td style={{borderBottomWidth: "0px"}}><a>Github.com/bsoftlimited</a></td>
                                </tr>
                                <tr>
                                    <td style={{borderBottomWidth: "0px"}}>Back of Amarata Yenagoa Bayelsa State</td>
                                    <td style={{borderBottomWidth: "0px"}}>+234 7087952034</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>
            <hr />
            <p className="footer-company-name text-center">All Rights Reserved. &copy;{ new Date().getFullYear() } <a>Bsoft Limited</a> Design By : <a>Okelekele Nobel Bobby</a></p>
        </Container>
    );
}

export default Footer;