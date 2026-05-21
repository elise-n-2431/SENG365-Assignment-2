import './App.css'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NotFound from "./pages/NotFound.tsx";
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import LoginPage from './pages/LoginPage';
import NewBlogPage from './pages/NewBlogPage';
import UserProfilePage from "./pages/UserProfilePage.tsx";
import EditBlogPage from "./pages/EditBlogPage.tsx";
import EditProfilePage from "./pages/EditProfilePage.tsx";
import NavBar from "./components/NavBar.tsx";
import SignUpPage from "./pages/SignUpPage";
import MyBlogsPage from "./pages/MyBlogs.tsx";

import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});


export default function App() {

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
          <Router>
            <NavBar />
              <Routes>
                <Route path="/" element={<BlogsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<SignUpPage />} />
                <Route path="/blogs/create" element= {<NewBlogPage />} />
                <Route path="/blogs/:id/edit" element={<EditBlogPage />} />
                <Route path="/my-blogs" element={<MyBlogsPage />}/>
                <Route path="/users/:id/edit" element={<EditProfilePage />} />
                <Route path="/blogs/:id" element={<BlogDetailPage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="*" element={<NotFound/>}/>
              </Routes>
          </Router>
      </ThemeProvider>
  )
}