import { createContext } from "react";

const UserContext = createContext(null);
const LoadingContext = createContext(false);
const CountriesContext = createContext([]);
// export const IsDesktopContext = createContext(window.innerWidth > 768);

export { UserContext, LoadingContext, CountriesContext };
