import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap/';


class Library extends Component {
    render () {
        return (
            <div>
                <Container>
                    <Row>
                        <Col lg xl={2}>
                            <div id="side-bar">
                                <div id="inner">
                                        <a href="#">
                                            <Row>Scores</Row>
                                        </a>
                                        <a href="#">
                                            <Row>New collection</Row>
                                        </a>
                                        <a href="#">
                                            <Row>Trash</Row>
                                        </a>
                                </div>
                            </div>
                        </Col>
                        <Col lg xl={10}>
                            <div id="main-bar">
                                <div id="library-content">
                                    <div id="header">
                                        <h1>
                                            Scores
                                        </h1>
                                    </div>
                                    <Row>
                                        <Col>Name</Col>
                                        <Col lg xl={2}>Date Modified</Col>
                                        <Col lg xl={2}>Sharing</Col>
                                        <Col></Col>  
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default Library;