import React, { useState } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  CssBaseline,
  Grid,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useDispatch, useSelector } from "react-redux";
import { startLoading, login, loginFailure } from "../slices/authSlice";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const { isAuthenticated, loading } = useSelector((state: any) => state.auth);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!emailOrUsername || !password) {
      setError("Both fields are required");
      return;
    }

    dispatch(startLoading()); // Trigger loading state

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Something went wrong. Please try again."
        );
      }

      const data = await response.json();
      if (data.statusCode === 200) {
        dispatch(login({ isAuthenticated: true, user: data.data })); // Save user data in Redux
        localStorage.setItem("loggedInUser", JSON.stringify(data.data)); // Save user data in local storage
        console.log("Login successful:", data);
        navigate("/", { state: { message: "Welcome back!" } }); // Redirect to home page
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
      dispatch(loginFailure()); // Reset loading state on failure
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }} role="alert">
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="emailOrUsername"
            label="Email Address or Username"
            name="emailOrUsername"
            autoComplete="emailOrUsername"
            autoFocus
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Sign In"
            )}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
