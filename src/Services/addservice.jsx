import { useState } from "react";
import { Domain } from "../utels/const";

function Addservice({ services, setservices, setShowForm }) {
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    price: '',
    discount: '',
    orderDate: '',
    active: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${Domain}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService),
    });

    const data = await res.json();
    setservices([...services, data]);
    setShowForm(false);
  };

  return (
    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
      <button className="absolute top-3 right-4 text-gray-500 text-2xl hover:text-red-600" onClick={() => setShowForm(false)}>×</button>
      <h2 className="text-2xl font-bold mb-6 text-center">Add New Service</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Title" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="w-full border p-3 rounded" required />

        <textarea placeholder="Description" value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="w-full border p-3 rounded" required />

        <input type="number" placeholder="Price" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="w-full border p-3 rounded" required />
<input type="number" placeholder="Discount" value={newService.discount} onChange={(e) => setNewService({ ...newService, discount: e.target.value })}className="w-full border p-3 rounded"required
/>

        <input type="date" value={newService.orderDate} onChange={(e) => setNewService({ ...newService, orderDate: e.target.value })} className="w-full border p-3 rounded" required />

        <div className="flex items-center gap-2">
          <label htmlFor="active">Active</label>
          <input type="checkbox" id="active" checked={newService.active} onChange={(e) => setNewService({ ...newService, active: e.target.checked })} />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">Save Service</button>
      </form>
    </div>
  );
}

export default Addservice;
