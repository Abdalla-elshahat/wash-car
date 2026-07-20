import { useState, useEffect } from 'react';
import { Domain } from "../utels/const";
import { BsFillTelephoneFill } from "react-icons/bs";
import { User, Mail, Shield, ShieldCheck, Activity } from "lucide-react";
import Swal from 'sweetalert2';

function EditClient({ client, setShowEditForm, setClients }) {
  const [formData, setFormData] = useState({
    role: 'client'
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        role: client.role || 'client'
      });
    }
  }, [client]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${Domain}/users/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: client._id,
          role: formData.role
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          title: 'Updated!',
          text: 'User role updated successfully.',
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          customClass: { popup: 'rounded-2xl' }
        });

        // Update local list state
        setClients((prev) =>
          prev.map((item) => (item._id === client._id ? { ...item, role: formData.role } : item))
        );
        setShowEditForm(false);
      } else {
        Swal.fire({
          title: 'Error!',
          text: data.message || 'Failed to update user role.',
          icon: 'error',
          confirmButtonColor: '#4f46e5',
          customClass: { popup: 'rounded-2xl' }
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Network Error!',
        text: 'Failed to connect to the server.',
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
        onClick={() => setShowEditForm(false)}
        title="Cancel"
      >
        &times;
      </button>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Edit User Role</h2>
        <p className="text-gray-400 text-xs mt-1">Update the system role for this user account.</p>
      </div>

      {/* User Information Display (Static) */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 shrink-0">
            <User size={20} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Full Name</p>
            <p className="text-sm font-bold text-gray-800 truncate">{client.fullname || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 shrink-0">
            <Mail size={18} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
            <p className="text-sm font-bold text-gray-800 truncate">{client.email || 'N/A'}</p>
          </div>
        </div>

        {client.phone && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50/50 flex items-center justify-center text-indigo-600 shrink-0">
              <BsFillTelephoneFill size={14} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Phone Number</p>
              <p className="text-sm font-bold text-gray-800 truncate">{client.phone}</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Select */}
        <div>
          <label className="block text-gray-700 text-xs font-semibold uppercase tracking-wider mb-1.5 text-left">Role Assignment</label>
          <div className="relative">
            <Shield className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ role: e.target.value })}
              className="w-full bg-gray-50/70 border border-gray-200 focus:bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer font-medium text-gray-700"
            >
              <option value="client">Client</option>
              <option value="laundry_owner">Laundry Owner</option>
              <option value="Admin">System Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between gap-4 pt-4">
          <button
            type="button"
            className="w-1/2 border border-gray-200 text-gray-500 font-semibold py-3 px-6 rounded-xl hover:bg-gray-50 transition active:scale-95 text-center"
            onClick={() => setShowEditForm(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-1/2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-6 rounded-xl transition duration-200 shadow-md transform hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></span>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditClient;
