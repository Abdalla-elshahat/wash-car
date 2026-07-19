import { useState, useEffect } from 'react';
import { Domain } from "../utels/const";
import { BsFillTelephonePlusFill } from "react-icons/bs";
function EditClient({ client, setShowEditForm, setClients }) {
  const [formData, setFormData] = useState({
    username: '',
    phonenumber: [''],
    address: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        username: client.username || '',
        phonenumber: Array.isArray(client.phonenumber) ? client.phonenumber : [client.phonenumber || ''],
        address: client.address || '',
      });
    }
    
  }, [client]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...formData.phonenumber];
    updatedPhones[index] = value;
    setFormData((prev) => ({
      ...prev,
      phonenumber: updatedPhones,
    }));
  };

  const addPhoneField = () => {
    setFormData((prev) => ({
      ...prev,
      phonenumber: [...prev.phonenumber, ''],
    }));
  };

  const removePhoneField = (index) => {
    const updatedPhones = [...formData.phonenumber];
    updatedPhones.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      phonenumber: updatedPhones,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${Domain}/clients/${client._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
    const updatedClient = await res.json();
  setClients((prev) => {
  return prev.map((c) => (c._id === updatedClient._id ? updatedClient : c));
});

      setShowEditForm(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Edit Client</h2>
      <form onSubmit={handleSubmit}>
        <div className=' block text-gray-700 text-lg mb-1 text-left'>
    <label htmlFor="username">Username</label>
        <input id='username'
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full mb-3 p-2 border rounded"
        />
        </div>
        <div className=" block text-gray-700 text-lg mb-1 text-left">
          <label className="block mb-1 font-semibold">Phone Numbers</label>
          {formData.phonenumber.map((phone, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input type="text" value={phone} onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder={`Phone #${index + 1}`}
                className="w-full p-2 border rounded"
              />
                <button type="button" onClick={addPhoneField} className="bg-green-500 text-white px-3 py-1 rounded mt-1"><BsFillTelephonePlusFill /></button>
              {formData.phonenumber.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhoneField(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <div className=' block text-gray-700 text-lg mb-1 text-left'>
         <label htmlFor="address">Address</label>
        <input
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Address"
          className="w-full mb-3 p-2 border rounded"
        />
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => setShowEditForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditClient;
