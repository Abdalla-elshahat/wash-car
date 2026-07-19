import { useEffect, useState } from 'react';
import { Domain } from '../utels/const';
import Addclient from './addclient';
import EditClient from './edite'; 
import Swal from 'sweetalert2';

function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const limit = 5;

async function getClients(limit = 2, page = 1) {
    const res = await fetch(`${Domain}/clients?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setClients(data.data);
    setCurrentPage(data.currentPage);
    setTotalPages(data.totalPages);
}
async function deleterecord(id) {
  const confirmResult = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to delete this client?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (confirmResult.isConfirmed) {
    const res = await fetch(`${Domain}/clients/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire('Deleted!', 'The client has been deleted.', 'success');
    getClients(limit, currentPage);
    } else {
      Swal.fire('Error!', 'Something went wrong.', 'error');
    }
  }
}

  useEffect(() => {
    getClients(limit, currentPage);
  }, [currentPage,showForm, showEditForm]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Clients</h1>

      {/* Title and Add Button */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Client
        </button>
      </div>

      {/* Form Overlay (Left-Aligned Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-10 z-50">
            <Addclient
              clients={clients}
              setClients={setClients}
              setShowForm={setShowForm}
            />
        
        </div>
      )}

      {showEditForm && selectedClient && (
  <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-10 z-50">
    <EditClient
      client={selectedClient}
      setClients={setClients}
      setShowEditForm={setShowEditForm}
    />
  </div>
)}


      {/* Table Format */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-300 shadow-sm rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Username</th>
              <th className="px-4 py-2 border border-gray-300">Phone</th>
              <th className="px-4 py-2 border border-gray-300">Address</th>
               <th className="px-4 py-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
       <tbody>
  {clients&&clients.length>0&&clients.map((client) => (
    <tr key={client._id} className="bg-white hover:bg-gray-50 transition">
      <td className="px-4 py-2 border border-gray-300">{client.username}</td>

      <td className="px-4 py-2 border border-gray-300">
        <ul className="space-y-1">
    {Array.isArray(client.phonenumber) &&
  client.phonenumber.map((phone, i) => (
    <li key={i} className="text-gray-800">📞 {phone}</li>
  ))
}

        </ul>
      </td>

      <td className="px-4 py-2 border border-gray-300">{client.address}</td>

      <td className="px-4 py-2 border border-gray-300">
        <button
          className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
          onClick={() => {
            setSelectedClient(client);
            setShowEditForm(true);
          }}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => deleterecord(client._id)}
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === index + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}

        <button
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

export default Clients;
