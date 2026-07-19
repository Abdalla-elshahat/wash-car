import { useEffect, useState } from 'react';
import { Domain } from '../utels/const';
import Swal from 'sweetalert2';
import Addservice from './addservice';
import Editservice from './edite';

function Services() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [services, setservices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  async function getServices() {
    const res = await fetch(`${Domain}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
    setservices(data);
  }
  async function deleterecord(id) {
    const confirmResult = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this service?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmResult.isConfirmed) {
      const res = await fetch(`${Domain}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire('Deleted!', 'The client has been deleted.', 'success');
        getServices();
      } else {
        Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    }
  }

  useEffect(() => {
    getServices();
  }, [showForm, showEditForm]);


  return (
    <div className="p-6  mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Services</h1>

      {/* Title and Add Button */}
      <div className="flex items-center justify-between border-b border-gray-300 pb-3 mb-6">
        <h1 className="text-3xl font-bold"></h1>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Service
        </button>
      </div>

      {/* Form Overlay (Left-Aligned Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-10 z-50">
          <Addservice
            services={services}
            setservices={setservices}
            setShowForm={setShowForm}
          />

        </div>
      )}

      {showEditForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-10 z-50">
          <Editservice
            services={selectedService}
            setservices={setservices}
            setShowEditForm={setShowEditForm}
          />
        </div>
      )}


      {/* Table Format */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-300 shadow-sm rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 border border-gray-300">Title</th>
              <th className="px-4 py-2 border border-gray-300">Description</th>
              <th className="px-4 py-2 border border-gray-300">Price</th>
              <th className="px-4 py-2 border border-gray-300">Discount</th>
              <th className="px-4 py-2 border border-gray-300">orderDate</th>
              <th className="px-4 py-2 border border-gray-300">active</th>
              <th className="px-4 py-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services && services.length > 0 && services.map((service) => (
              <tr key={service._id} className="bg-white hover:bg-gray-50 transition">
                <td className="px-4 py-2 border border-gray-300">{service.title}</td>
                <td className="px-4 py-2 border border-gray-300">{service.Description}</td>
                <td className="px-4 py-2 border border-gray-300 d-">{service.price}</td>
                <td className="px-4 py-2 border border-gray-300">{service.discount}</td>
                <td className="px-4 py-2 border border-gray-300">{new Date(service.orderDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 border border-gray-300">{service.active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                    onClick={() => {
                      setSelectedService(service);
                      setShowEditForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded"
                    onClick={() => deleterecord(service._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Services;
