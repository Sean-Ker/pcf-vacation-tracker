import { createContext } from "react";

const IdentityContext = createContext(null);
const UsersContext = createContext([]);
const CountriesContext = createContext([]);
// export const IsDesktopContext = createContext(window.innerWidth > 768);

export { IdentityContext, UsersContext, CountriesContext };
