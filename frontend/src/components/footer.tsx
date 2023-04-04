import { Container, Row, Col, Table } from "react-bootstrap";

const Footer = () =>{
    return (
        <div className="w-100 text-center bg-grey p-3">
            <Container>
                <div className="section" id="Contacts">
                    <Row>
                        <Col md={6}>
                            <Table>
                                <tbody>
                                    <tr><th className="text-blue">Quick Links</th></tr>
                                    <tr>
                                        <td><a>Latest Event</a></td>
                                        <td><a>Terms and Conditions</a></td>
                                    </tr>
                                    <tr>
                                        <td><a>Privacy policy</a></td>
                                        <td><a>Contact us</a></td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                        <Col md={6}>
                            <Table>
                                <tbody>
                                    <tr><th className="text-blue">Contacts</th></tr>
                                    <tr>
                                        <td>Bsoftlimited@gmail.com</td>
                                        <td><a>Github.com/bsoftlimited</a></td>
                                    </tr>
                                    <tr>
                                        <td>Back of Amarata Yenagoa Bayelsa State</td>
                                        <td>+234 7087952034</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                </div>
            </Container>
            <hr />
            <p className="footer-company-name">All Rights Reserved. &copy; 2021 <a>Bsoft Limited</a> Design By : <a>Okelekele Nobel Bobby</a></p>
        </div>
    );``
}

export default Footer;