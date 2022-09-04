import React, { useState, useEffect } from "react";
import { Col, Row, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import Styled from "styled-components";

// const NotFoundImage = Styled(Image)`
//     margin-bottom: 1rem;
//     display: block;
//     width: 100%;
//     /* width: 10; */
//     /* @media (max-width: 768px) {
//         width: 50vw;
//         margin-left: auto;
//         margin-right: auto;
//     } */
// `;
// ToDo: Add maybe a third of the screen column, align stuff left in there.
export default function NotFound() {
    // const [isDesktop, setDesktop] = useState(window.innerWidth > 768);

    // const updateMedia = () => {
    //     setDesktop(window.innerWidth > 768);
    // };

    // useEffect(() => {
    //     window.addEventListener("resize", updateMedia);
    //     return () => window.removeEventListener("resize", updateMedia);
    // });

    const content = (
        <>
            <Image
                fluid
                src={window.location.origin + "/404_not_found.png"}
                alt="404 page not found."
            />

            <h4>
                Oops... The page you're looking for isn't here. <Link to="/">Go Home.</Link>
            </h4>
        </>
    );

    // if (isDesktop) {
    return (
        <Row className="justify-content-center">
            <Col xs="12" lg="6" xl="6">
                {content}
            </Col>
        </Row>
    );
    // }

    // return content;
}
