import { useState } from "react";
import { Domain } from "../utels/const";
import { BsFillTelephoneFill } from "react-icons/bs";
import { User, Mail, Shield, ShieldCheck, Lock, Activity, Eye, EyeOff } from "lucide-react";
import Swal from 'sweetalert2';

function Addclient({ clients, setClients, setShowForm }) {
  const [newUser, setNewUser] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    role: 'client',
    isActive: true,
    isVerified: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // First try standard signup endpoint if role is client, or POST /users if it supports CRUD
      const endpoint = newUser.role === 'client' ? `${Domain}/users/signup` : `${Domain}/users`;
      
      const payload = {
        fullname: newUser.fullname,
        username: newUser.fullname, // support both name systems
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        isVerified: newUser.isVerified
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'User successfully created.',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          customClass: { popup: 'rounded-2xl' }
        });
        
        // Append user to the list
        setClients([...clients, data.data || data]);
        setShowForm(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to create user.',
          icon: 'error',
          confirmButtonColor: '#4f46e5',
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Network Error!',
        text: 'Failed to communicate with the server.',
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        customClass: { popup: 'rounded-2xl' }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg relative border border-gray-100 animate-scaleUp">
      {/* Close button */}
      <button
        className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl font-bold p-1 rounded-full hover:bg-gray-50 transition"
        onClick={() => setShowForm(false)}
        title="Close Dialog"
      >
        &times;
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Add New User Account</h2>
        <p className="text-gray-400 text-xs mt-1">Create admin profiles, service providers, or clients.</p>
      </div>

      <form onSubmit={handleAddUser} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1 text-left">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              type="text"
              value={newUser.fullname}
              placeholder="e.g. John Doe"
              onChange={(e) => setNewUser({ ...newUser, fullname: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1 text-left">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              type="email"
              value={newUser.email}
              placeholder="john@example.com"
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1 text-left">Account Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={newUser.password}
              placeholder="••••••••"
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-11 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1 text-left">Phone Number</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-gray-400"><BsFillTelephoneFill size={14} /></span>
            <input
              type="tel"
              placeholder="e.g. 01115337822"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1 text-left">Role Assignment</label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer font-medium text-gray-700"
            >
              <option value="client">Client</option>
              <option value="laundry_owner">Laundry Owner</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
        </div>

        {/* Toggle Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Active status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Active State</span>
            </div>
            <input
              type="checkbox"
              checked={newUser.isActive}
              onChange={(e) => setNewUser({ ...newUser, isActive: e.target.checked })}
              className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Verified status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-600">Verified User</span>
            </div>
            <input
              type="checkbox"
              checked={newUser.isVerified}
              onChange={(e) => setNewUser({ ...newUser, isVerified: e.target.checked })}
              className="h-4.5 w-4.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-md transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Addclient;
