import React from 'react'
import Clients from './clients/client'
import Orders from './orders/orders'
import Home from './Home'
import Service from './Services/service'
import LaundryServices from './Services/LaundryServices'
import { Route, Routes } from 'react-router-dom'
import Login from "./Auth/Login/Login";
import SignUp from "./Auth/SignUp/SignUp";
import ForgetPassword from "./Auth/ForgotPassword/ForgotPassword";
import Repass from "./Auth/Repass/Repass";
import Verify from "./Auth/Verify/Verify";
import Verifyforget from "./Auth/Verifyforget/Verifyforget";
import Profile from './clients/Profile/Profle'
import OwnerLaundries from './laundries/OwnerLaundries'
import LaundryDetails from './laundries/LaundryDetails'
import AdminInactiveLaundries from './laundries/AdminInactiveLaundries'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
function Routeapp() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
        <Route path="/forgetpass" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
        <Route path="/changepass" element={<PublicRoute><Repass /></PublicRoute>} />
        <Route path="/Verify" element={<PublicRoute><Verify /></PublicRoute>} />
        <Route path="/Verifyforget" element={<PublicRoute><Verifyforget /></PublicRoute>} />

        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><Clients /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/services/:laundryId" element={<PrivateRoute><LaundryServices /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/laundries/owner" element={<PrivateRoute><OwnerLaundries /></PrivateRoute>} />
        <Route path="/laundries/:id" element={<PrivateRoute><LaundryDetails /></PrivateRoute>} />
        <Route path="/admin/laundries/inactive" element={<PrivateRoute><AdminInactiveLaundries /></PrivateRoute>} />

      </Routes>
    </div>
  )
}

export default Routeapp;