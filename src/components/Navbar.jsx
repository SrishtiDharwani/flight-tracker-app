import React, { useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "./store/AuthContext";

const Navbar = ({ name }) => {
  const auth = useContext(AuthContext);
  const logoutHandler = () => {
    auth.logout();

    // emailRef.current.value="";
    // passRef.current.value="";
  };
  console.log(name);
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flight Tracker
          </Typography>
          {auth.isLoggedIn && (
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {name}
            </Typography>
          )}
          {/* <Button
            color="inherit"
            disabled={!auth.isLoggedIn}
            onClick={logoutHandler}
          >
            Logout
          </Button> */}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
