import { Spin } from "antd";
import styled from "styled-components";
import React, { useState, useEffect, useContext } from "react";
import ReactCountryFlag from "react-country-flag";
import { CountriesContext } from "../Contexts";
import axios from "axios";

const FlagIcon = styled(ReactCountryFlag)`
    margin-right: 5px;
    font-size: 1.5em;
`;

const EmployeeName = ({ fname, lname, country_code, style = null }) => {
    const { countries } = useContext(CountriesContext);

    // If countries is empty, return null:
    const country =
        countries.length === 0
            ? null
            : countries.filter(country => country["_id"] === country_code)[0];

    if (!country) {
        return (
            <span style={style}>
                {fname} {lname}
            </span>
        );
    }

    return (
        <>
            <FlagIcon
                countryCode={country["_id"]}
                svg
                title={country ? country["name"] : ""}
                aria-label={country ? country["name"] : ""}
            />
            <span style={style}>
                {fname} {lname}
            </span>
        </>
    );
};

export default EmployeeName;
