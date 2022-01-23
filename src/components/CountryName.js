import React from "react";
import ReactCountryFlag from "react-country-flag";

const CountryName = ({ countries, id }) => {
    const name = countries.filter(c => c["_id"].toUpperCase() === id.toUpperCase())[0]["name"];
    return (
        <>
            <ReactCountryFlag
                countryCode={id}
                svg
                style={{
                    fontSize: "2em",
                    marginRight: "5px",
                    // lineHeight: "2em",
                }}
                title={name}
                aria-label={name}
            />{" "}
            {name}
        </>
    );
};

export default CountryName;
