import {BrowserRouter, Routes, Route  } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Despesa from '../pages/Despesa'

import Header from '../components/Header';
import Combustivel from '../pages/Combustivel';
import LoginForm from '../pages/Login';


import ProtectedRoute from './protectRoute';

function RoutesApp(){


    return(
        <BrowserRouter>
            <Header />
            <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/" element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/combustivel" element={<Combustivel />} />
                <Route path="/despesa" element={<Despesa />} />
            </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default RoutesApp;