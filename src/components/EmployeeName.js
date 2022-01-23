import React, { useState, useEffect, useContext } from "react";
import ReactCountryFlag from "react-country-flag";
import axios from "../api/axios";
import { CountriesContext } from "../Contexts";

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
    return (
        <>
            <ReactCountryFlag
                countryCode={country["_id"]}
                svg
                style={{
                    fontSize: "2em",
                    marginRight: "5px",
                    // lineHeight: "2em",
                }}
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
