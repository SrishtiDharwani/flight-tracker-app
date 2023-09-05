import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "./store/AuthContext";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { IconButton } from "@mui/material";
import { InputLabel } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { VisibilityOff } from "@mui/icons-material";
import { Modal } from "@mui/material";
import axios from "axios";
import BasicLoader from "./common/BasicLoader";
import { toast } from "react-hot-toast";

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="/">
        Flight Tracker
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const defaultTheme = createTheme();

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState(true);
  const nameRef = useRef();
  const emailRef = useRef();
  const passRef = useRef();
  const [values, setValues] = React.useState({
    password: "",
    showPassword: false,
  });

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handlePasswordChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const authSubmitHandler = async (event) => {
    event.preventDefault();

    if (loginMode) {
      try {
        setIsLoading(true);
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/api/user/signin",
          {
            email: emailRef.current.value,
            password: passRef.current.value,
          }
        );
        auth.login(
          response.data.userId,
          response.data.token,
          response.data.name
        );
        toast.success("Signin successful!");
        setIsLoading(false);
      } catch (err) {
        console.log(err.response.data.message);
        toast.error(err.response.data.message);
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        const response = await axios.post(
          process.env.REACT_APP_API_URL + "/api/user/signup",
          {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passRef.current.value,
          }
        );
        auth.login(
          response.data.userId,
          response.data.token,
          response.data.name
        );
        toast.success("Signin successful!");
        setIsLoading(false);
      } catch (err) {
        console.log(err.response.data.message);
        toast.error(err.response.data.message);
        setIsLoading(false);
      }
    }
  };

  const switchModeHandler = () => {
    setLoginMode(!loginMode);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Modal open={isLoading}>
        <BasicLoader />
      </Modal>
      <Container
        component="main"
        maxWidth="xs"
        sx={{ background: "#FEF7E5", padding: "0 19%", borderRadius: "2%" }}
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            {loginMode ? "Sign in" : "Sign Up"}
          </Typography>
          <Box
            component="form"
            onSubmit={authSubmitHandler}
            noValidate
            sx={{ mt: 1 }}
          >
            {!loginMode && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="off"
                autoFocus
                inputRef={nameRef}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="off"
              autoFocus
              inputRef={emailRef}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              autoComplete="off"
              name="password"
              label="Password"
              // type="password"
              id="password"
              inputRef={passRef}
              type={values.showPassword ? "text" : "password"}
              onChange={handlePasswordChange("password")}
              value={values.password}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {values.showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {loginMode ? "Sign in" : "Sign up"}
            </Button>

            <Typography
              component="body1"
              variant="h9"
              onClick={switchModeHandler}
              sx={{ cursor: "pointer", color: "#1976d2" }}
            >
              {loginMode
                ? "Don't have an account? Sign up here!"
                : "Already have an account? Sign in here!"}
            </Typography>
            {/* <Button
              onClick={switchModeHandler}
              fullWidth
              variant="text"
              sx={{ mt: 3, mb: 2 }}
            >
              Switch to {loginMode ? "Sign up" : "Sign in"}
            </Button> */}
          </Box>
        </Box>
        <Copyright sx={{ mt: 4, pb: 2 }} />
      </Container>
    </ThemeProvider>
  );
};

export default Auth;
