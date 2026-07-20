import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar/Navbar';
import { getLaundryById } from '../apicalls/laundry';
import { createOrder, validateCoupon } from '../apicalls/order';
import { Domain } from '../utels/const';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Star,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
  Droplets,
  Image as ImageIcon,
  Save,
  X,
  Search,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Ticket
} from 'lucide-react';

function LaundryServices() {
  const { laundryId } = useParams();
  const navigate = useNavigate();

  const [laundry, setLaundry] = useState(null);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Order Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderService, setSelectedOrderService] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('عايز تنظيف سريع');
  const [orderPaymentMethod, setOrderPaymentMethod] = useState('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Form states for add/edit service
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImage, setFormImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const currentUserId = Cookies.get('userId');
  const isOwner = laundry && (laundry.ownerId?._id === currentUserId || laundry.ownerId === currentUserId);

  const fetchLaundryAndServices = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch Laundry Details
      const laundryData = await getLaundryById(laundryId);
      setLaundry(laundryData);

      // Fetch Services
      const token = Cookies.get('token');
      const res = await fetch(`${Domain}/services/${laundryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch services for this laundry');
      }

      const servicesData = await res.json();
      setServices(servicesData);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (laundryId) {
      fetchLaundryAndServices();
    }
  }, [laundryId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open Order Modal
  const openOrderModal = async (service) => {
    setSelectedOrderService(service);
    setOrderNotes('عايز تنظيف سريع');
    setOrderPaymentMethod('stripe');
    setCouponCode('');
    setCouponResult(null);
    setCouponError('');

    try {
      const token = Cookies.get('token');
      if (token) {
        const res = await fetch(`${Domain}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const uData = await res.json();
          setCustomerName(uData.fullname || '');
          setCustomerPhone(uData.phone || '');
        }
      }
    } catch (err) {
      console.error(err);
    }

    setShowOrderModal(true);
  };

  // Validate Coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await validateCoupon(couponCode.trim(), laundryId);
      const basePrice = Number(selectedOrderService?.price) || 0;
      let discount = 0;
      if (res.discountType === 'percentage') {
        discount = (basePrice * (res.discountValue || 0)) / 100;
        if (res.maxDiscountAmount && res.maxDiscountAmount > 0) {
          discount = Math.min(discount, res.maxDiscountAmount);
        }
      } else if (res.discountType === 'fixed') {
        discount = res.discountValue || 0;
      }
      const priceAfterDiscount = Math.max(0, basePrice - discount);
      setCouponResult({ ...res, discount, priceAfterDiscount });
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrderService) return;
    setSubmittingOrder(true);
    try {
      const payload = {
        laundryId: laundryId,
        serviceId: selectedOrderService._id,
        customerName: customerName,
        phone: customerPhone,
        address: customerAddress,
        notes: orderNotes,
        paymentMethod: orderPaymentMethod,
      };
      if (couponCode.trim()) {
        payload.couponCode = couponCode.trim();
      }

      const res = await createOrder(payload);

      setShowOrderModal(false);

      let successMessage = `Order #${res.orderId?.slice(-8)} created successfully!`;

      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: successMessage,
        showCancelButton: true,
        confirmButtonText: 'View My Orders',
        cancelButtonText: 'Close',
        confirmButtonColor: '#4f46e5',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/profile');
        }
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: err.message || 'Could not create order.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Create Service
  const openAddModal = () => {
    setFormTitle('');
    setFormDescription('');
    setFormPrice('');
    setFormDiscount('');
    setFormActive(true);
    setFormImage(null);
    setImagePreview(null);
    setShowAddModal(true);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('description', formDescription);
      formData.append('price', formPrice);
      formData.append('discount', formDiscount || '0');
      formData.append('laundryId', laundryId);
      formData.append('active', formActive ? 'true' : 'false');
      if (formImage) {
        formData.append('image', formImage);
      }

      const res = await fetch(`${Domain}/services`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create service');
      }

      setShowAddModal(false);
      Swal.fire({
        title: 'Success!',
        text: 'Service created successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchLaundryAndServices();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  // Edit Service
  const openEditModal = (service) => {
    setSelectedService(service);
    setFormTitle(service.title || '');
    setFormDescription(service.description || '');
    setFormPrice(service.price || '');
    setFormDiscount(service.discount || '');
    setFormActive(service.active !== false);
    setFormImage(null);
    setImagePreview(service.image ? (service.image.startsWith('http') ? service.image : `${Domain}/uploads/services/${service.image}`) : null);
    setShowEditModal(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    if (!selectedService) return;
    try {
      const token = Cookies.get('token');
      const formData = new FormData();
      formData.append('title', formTitle);
      formData.append('description', formDescription);
      formData.append('price', formPrice);
      formData.append('discount', formDiscount || '0');
      formData.append('active', formActive ? 'true' : 'false');
      if (formImage) {
        formData.append('image', formImage);
      }

      const res = await fetch(`${Domain}/services/${selectedService._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update service');
      }

      setShowEditModal(false);
      Swal.fire({
        title: 'Updated!',
        text: 'Service updated successfully!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchLaundryAndServices();
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: err.message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId) => {
    const result = await Swal.fire({
      title: 'Delete Service?',
      text: 'Are you sure you want to delete this service? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const token = Cookies.get('token');
        const res = await fetch(`${Domain}/services/${serviceId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to delete service');
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Service has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchLaundryAndServices();
      } catch (err) {
        Swal.fire({
          title: 'Error!',
          text: err.message,
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  };

  const getLogoUrl = (logo) => {
    if (!logo) return null;
    if (logo.startsWith('http')) return logo;
    return `${Domain}/uploads/laundries/${logo}`;
  };

  const getServiceImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${Domain}/uploads/services/${image}`;
  };

  const filteredServices = services.filter(service =>
    service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading services...</p>
      </div>
    );
  }

  if (error || !laundry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center max-w-md shadow-sm">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
          <p className="font-bold text-lg mb-2">Error Occurred</p>
          <p className="text-sm mb-4">{error || 'Laundry details could not be loaded.'}</p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl transition duration-200" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/40 pb-20">

        {/* Laundry Header Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-xl relative overflow-hidden py-12 px-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg flex-shrink-0">
                {laundry.logo ? (
                  <img src={getLogoUrl(laundry.logo)} alt={laundry.name} className="h-full w-full object-cover" />
                ) : (
                  <Sparkles className="text-indigo-300" size={36} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight">{laundry.name}</h1>
                  <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {laundry.status || 'Active'}
                  </span>
                </div>
                <p className="text-indigo-200 text-sm mt-1 max-w-xl line-clamp-2">{laundry.description || "No description provided."}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-xs text-indigo-200">
                  {laundry.phone && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <Phone size={12} className="text-indigo-300" />
                      {laundry.phone}
                    </span>
                  )}
                  {laundry.address && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <MapPin size={12} className="text-indigo-300" />
                      {laundry.address}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Clock size={12} className="text-indigo-300" />
                    {laundry.workingHours?.from || "09:00"} - {laundry.workingHours?.to || "22:00"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-5 rounded-xl border border-white/10 backdrop-blur-sm transition duration-200 text-sm shadow-sm"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              {isOwner && (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition duration-200 text-sm shadow-md shadow-indigo-900/20"
                >
                  <Plus size={16} />
                  <span>Add Service</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-6 mt-12">

          {/* Filters & Section Title */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-150 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Available Services</h2>
              <p className="text-xs text-gray-500 mt-0.5">Explore premium services and special discounts</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition duration-150 outline-none"
              />
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-150 p-16 text-center max-w-lg mx-auto shadow-sm">
              <Droplets className="mx-auto text-indigo-400/80 mb-4" size={56} />
              <h3 className="text-lg font-bold text-gray-800">No Services Found</h3>
              <p className="text-gray-500 text-sm mt-1">There are no services registered or matching your search criteria.</p>
              {isOwner && (
                <button
                  onClick={openAddModal}
                  className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-xl transition duration-150 inline-flex items-center gap-1 text-sm shadow-sm"
                >
                  <Plus size={16} /> Add First Service
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => {
                const imageUrl = getServiceImageUrl(service.image);
                const discountAmount = Number(service.discount) || 0;
                const originalPrice = Number(service.price) || 0;
                const finalPrice = discountAmount > 0 ? Math.max(0, originalPrice - discountAmount) : originalPrice;

                return (
                  <div
                    key={service._id}
                    className={`bg-white rounded-2xl border ${service.active ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-300 opacity-75'} overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative`}
                  >
                    {/* Discount Badge */}
                    {discountAmount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm">
                        -{discountAmount} EGP Off
                      </span>
                    )}

                    {/* Image Header */}
                    <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                      {imageUrl ? (
                        <img src={imageUrl} alt={service.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 flex flex-col items-center justify-center gap-2 text-indigo-600/80">
                          <Droplets size={32} className="animate-pulse" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Premium Wash</span>
                        </div>
                      )}

                      {/* Active Status Badge */}
                      <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm ${
                        service.active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {service.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-grow flex flex-col">
                      <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition duration-150 text-lg line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-gray-500 text-sm mt-1.5 flex-grow line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Pricing and Action */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-gray-400 font-medium">Price</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-extrabold text-indigo-600">{finalPrice} EGP</span>
                            {discountAmount > 0 && (
                              <span className="text-xs text-gray-400 line-through">{originalPrice} EGP</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openOrderModal(service)}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-md transition transform active:scale-95"
                          >
                            <ShoppingBag size={14} /> Order Now
                          </button>

                          {isOwner && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => openEditModal(service)}
                                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl transition duration-150"
                                title="Edit Service"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteService(service._id)}
                                className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition duration-150"
                                title="Delete Service"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Modal */}
        {showOrderModal && selectedOrderService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <ShoppingBag size={20} className="text-indigo-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Book Wash Order</h3>
                    <p className="text-xs text-indigo-200">{selectedOrderService.title}</p>
                  </div>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="text-white/80 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 overflow-y-auto">
                {/* Service Summary Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service</span>
                    <p className="font-bold text-gray-800 text-sm">{selectedOrderService.title}</p>
                    <p className="text-xs text-indigo-600 font-semibold">{laundry.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Price</span>
                    <p className="text-lg font-extrabold text-indigo-600">{selectedOrderService.price} EGP</p>
                  </div>
                </div>

                {/* Customer Contact & Address Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. احمد محمد"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 01012345678"
                      className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Delivery Address / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="e.g. 15 الشارع الرئيسي، المعادي، القاهرة"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. عايز تنظيف سريع..."
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition"
                  />
                </div>

                {/* Coupon Code Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Discount Coupon (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase());
                        setCouponResult(null);
                        setCouponError('');
                      }}
                      placeholder="e.g. SAVE10"
                      className="flex-grow p-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm uppercase font-mono font-bold transition"
                    />
                    <button
                      type="button"
                      onClick={handleValidateCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm"
                    >
                      {couponLoading ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-medium mt-1">{couponError}</p>}
                  {couponResult && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                      <span className="font-semibold flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" /> Coupon applied! (-{couponResult.discount} EGP)
                      </span>
                      <span className="font-extrabold text-sm">
                        Final: {couponResult.priceAfterDiscount} EGP
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'stripe', label: 'Stripe (Card)' },
                      { id: 'cash', label: 'Cash on Delivery' },
                      { id: 'card', label: 'Card on Pickup' },
                      { id: 'online', label: 'Online Payment' },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs font-bold ${
                          orderPaymentMethod === m.id
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{m.label}</span>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={m.id}
                          checked={orderPaymentMethod === m.id}
                          onChange={(e) => setOrderPaymentMethod(e.target.value)}
                          className="accent-indigo-600"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="flex-grow bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    {submittingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> Confirm Order ({couponResult ? couponResult.priceAfterDiscount : selectedOrderService.price} EGP)
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg">Add New Service</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateService} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Full Interior & Exterior Wash"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe what's included in this service..."
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (EGP) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Discount (EGP)</label>
                    <input
                      type="number"
                      min="0"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Image</label>
                  <div className="mt-1 flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer transition text-sm">
                      <ImageIcon size={16} />
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="h-10 w-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="active-add"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="active-add" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                    Enable this service for customers
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Save size={16} /> Create Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedService && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 text-white flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg">Edit Service</h3>
                <button onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateService} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (EGP) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Discount (EGP)</label>
                    <input
                      type="number"
                      min="0"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Service Image</label>
                  <div className="mt-1 flex items-center gap-4">
                    <label className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer transition text-sm">
                      <ImageIcon size={16} />
                      Replace Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="h-10 w-16 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="active-edit"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="active-edit" className="text-sm font-semibold text-gray-700 select-none cursor-pointer">
                    Enable this service for customers
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
  );
}

export default LaundryServices;
