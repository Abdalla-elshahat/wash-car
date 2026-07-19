import { useState, useEffect } from 'react';
import { Domain } from "../utels/const";

function Editservice({ services, setservices, setShowEditForm }) {
  const [formData, setFormData] = useState({
    title: '',
    Description: '',
    price: '',
    discount: '',
    orderDate: '',
    active: false,
  });

  useEffect(() => {
    if (services) {
      setFormData({
        title: services.title || '',
        Description: services.Description || '',
        price: services.price || '',
        discount: services.discount || '',
        orderDate: services.orderDate?.split('T')[0] || '',
        active: services.active || false,
      });
    }
  }, [services]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${Domain}/services/${services._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const updated = await res.json();
      setservices(prev => prev.map(item => item._id === updated._id ? updated : item));
      setShowEditForm(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg relative">
      <button className="absolute top-3 right-4 text-gray-500 text-2xl hover:text-red-600" onClick={() => setShowEditForm(false)}>×</button>
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Service</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border p-3 rounded" required />

        <textarea value={formData.Description} onChange={(e) => setFormData({ ...formData, Description: e.target.value })} className="w-full border p-3 rounded" required />

        <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border p-3 rounded" required />
<input type="number" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="Discount" className="w-full border p-3 rounded"
  required
/>

        <input type="date" value={formData.orderDate} onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })} className="w-full border p-3 rounded" required />

        <div className="flex items-center gap-2">
          <label htmlFor="active">Active</label>
          <input type="checkbox" id="active" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
        </div>

        <div className="flex justify-between">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Save</button>
          <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded" onClick={() => setShowEditForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default Editservice;
