import styled from "styled-components";
import React, { useState, useEffect, useContext } from "react";
import ReactCountryFlag from "react-country-flag";
import axios from "../api/axios";
import { CountriesContext } from "../Contexts";

const FlagIcon = styled(ReactCountryFlag)`
    margin-right: 5px;
    font-size: 1.5em;
`;

const EmployeeName = ({ fname, lname, country_code, style = null }) => {
    // const [country, setCountry] = useState();
    const { countries } = useContext(CountriesContext);

    // useEffect(() => {
    //     // const fetchCountry = async () => {
    //     //     const countryRes = await axios.get( `/locations/${country_code}`);
    //     //     if (countryRes === null) {
    //     //         setCountry(null);
    //     //     }
    //     //     setCountry(countryRes["data"]);
    //     // };
    //     // fetchCountry();
    //     setCountry(countries[country_code]);
    // }, [countries, country_code]);

    const country = countries.filter(c => c["_id"] === country_code)[0];

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
            />{" "}
            <span style={style}>
                {fname} {lname}
            </span>
        </>
    );
};

export default EmployeeName;
