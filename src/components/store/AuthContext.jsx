import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  name:null,
  token: null,
  login: () => {},
  logout: () => {},
});

// const initialState = {
//   isLoggedIn: false,
//   userId: null,
//   token: null,
//   login: () => {},
//   logout: () => {},
// };

// export const AuthContextProvider = (props) => {
//   const [token, setToken] = useState(false);
//   const [userId, setUserId] = useState(false);


//   const login = useCallback((uid, token, expDate) => {
//     setToken(token);
//     setUserId(uid);
    

//     localStorage.setItem(
//       "userData",
//       JSON.stringify({
//         userId: uid,
//         token: token,
        
//       })
//     );
//   }, []);

//   const logout = useCallback(() => {
//     setToken(null);
//     setUserId(null);
//     localStorage.removeItem("userData");
//   }, []);


//   return{token,userId,login,logout};
