import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Game from './pages/Game'
import { useAuth } from './contexts/AuthContext'
import './app.css'

function PrivateRoute({ children }){
const { token } = useAuth();
if(!token) return <Navigate to="/login" />;
return children;
}


export default function App(){
return (
<Routes>
<Route path="/login" element={<Login/>} />
<Route path="/" element={<PrivateRoute><Game/></PrivateRoute>} />
</Routes>
)
}