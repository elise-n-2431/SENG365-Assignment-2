// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'

import './App.css'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from './components/ProtectedRoute';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import LoginPage from './pages/LoginPage';
import NewBlogPage from './pages/NewBlogPage';
import UserProfilePage from "./pages/UserProfilePage.tsx";
import EditBlogPage from "./pages/EditBlogPage.tsx";
// import MyBlogsPage from "./components/BlogSeriesSection.tsx";
import EditProfilePage from "./pages/EditProfilePage.tsx";
import NavBar from "./components/NavBar.tsx";
import SignUpPage from "./pages/SignUpPage";

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import React from "react";

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});


export default function App() {

  const [navKey, setNavKey] = React.useState(0);
  const triggerNavRefresh = () => setNavKey(k => k + 1);

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />  {/* resets background to dark and sets base text colour */}
          <Router>
            <NavBar refreshKey={navKey} />
            <Routes>
              {/* Public */}
              <Route path="/" element={<BlogsPage />} />
              <Route path="/login" element={<LoginPage onLogin={triggerNavRefresh} />} />
              <Route path="/register" element={<SignUpPage onLogin={triggerNavRefresh}/>} />

              {/* Auth-required */}
              <Route path="/blogs/create" element={
                <ProtectedRoute><NewBlogPage /></ProtectedRoute>
              } />
              <Route path="/blogs/:id/edit" element={
                <ProtectedRoute><EditBlogPage /></ProtectedRoute>
              } />


              {/*<Route path="/my-blogs" element={*/}
              {/*  <ProtectedRoute><MyBlogsPage /></ProtectedRoute>*/}
              {/*} />*/}
              <Route path="/users/:id/edit" element={<EditProfilePage onProfileUpdate={triggerNavRefresh} />} />

              <Route path="/blogs/:id" element={<BlogDetailPage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="*" element={<NotFound/>}/>


            </Routes>
          </Router>
      </ThemeProvider>
  )
}