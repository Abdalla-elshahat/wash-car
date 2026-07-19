import { useEffect, useState } from "react";
import { Domain } from "../utels/const";
import { BsFillTelephonePlusFill } from "react-icons/bs";

function Addclient({ clients, setClients, setShowForm }) {
  const [newClient, setNewClient] = useState({
    username: '',
    phonenumber: [''],
    address: ''
  });

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...newClient.phonenumber];
    updatedPhones[index] = value;
    setNewClient((prev) => ({
      ...prev,
      phonenumber: updatedPhones,
    }));
  };

  const addPhoneField = () => {
    setNewClient((prev) => ({
      ...prev,
      phonenumber: [...prev.phonenumber, ''],
    }));
  };

  const removePhoneField = (index) => {
    const updatedPhones = [...newClient.phonenumber];
    updatedPhones.splice(index, 1);
    setNewClient((prev) => ({
      ...prev,
      phonenumber: updatedPhones,
    }));
  };

  const handleAddClient = async (e) => {
    e.preventDefault();

    const clientToAdd = {
      username: newClient.username,
      phonenumber: newClient.phonenumber.filter(p => p.trim() !== ''), // حذف الفارغ
      address: newClient.address,
    };

    const res = await fetch(`${Domain}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientToAdd),
    });

    const data = await res.json();

    setClients([...clients, data]);
    setNewClient({ username: '', phonenumber: [''], address: '' });
    setShowForm(false);
  };

  return (
    <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10">
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-3xl font-bold"
        onClick={() => setShowForm(false)}
        title="Close"
      >
        &times;
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Add New Client</h2>

      <form onSubmit={handleAddClient} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-lg mb-1 text-left">Username</label>
          <input
            type="text"
            value={newClient.username}
            placeholder="Username"
            onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-lg mb-1 text-left font-semibold">Phone Numbers</label>
          {newClient.phonenumber.map((phone, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder={`Phone #${index + 1}`}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                required
              />
              <button
                type="button"
                onClick={addPhoneField}
                className="bg-green-500 text-white p-2 rounded"
                title="Add phone"
              >
                <BsFillTelephonePlusFill />
              </button>
              {newClient.phonenumber.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhoneField(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-gray-700 text-lg mb-1 text-left">Address</label>
          <input
            type="text"
            placeholder="Address"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            required
          />
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg shadow-md transition duration-200"
          >
            Save Client
          </button>
        </div>
      </form>
    </div>
  );
}

export default Addclient;
