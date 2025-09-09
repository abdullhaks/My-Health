import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getSubscriptions, createSubscription, updateSubscription, deActivateSubscription, ActivateSubscription } from '../../api/admin/adminApi';
import { Popconfirm, Modal, Button } from 'antd';

type Product = {
  id: string;
  name: string;
  active: boolean;
  description?: string;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: string;
    };
  };
};

type ValidationErrors = {
  name?: string;
  description?: string;
  price?: string;
};

const AdminSubscriptions = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'inr',
    interval: 'month',
    productId: null as string | null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (deleteConfirm && deleteButtonRef.current) {
      deleteButtonRef.current.focus();
    }
  }, [deleteConfirm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptions();
      const existingPlans = response.data.filter((plan: Product) => plan.active);
      setProducts(existingPlans || []);
    } catch (error) {
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || 'Failed to fetch products'
          : 'Failed to fetch products'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkProductNameExists = async (name: string, productId: string | null): Promise<boolean> => {
    try {
      const response = await getSubscriptions();
      return response.data.some(
        (product: Product) =>
          product.active &&
          product.name.toLowerCase() === name.toLowerCase() &&
          product.id !== productId
      );
    } catch (error) {
      console.error('Error checking product name:', error);
      return false;
    }
  };

  const checkProductPriceExists = async (
    price: number,
    currency: string,
    interval: string,
    productId: string | null
  ): Promise<boolean> => {
    try {
      const response = await getSubscriptions();
      return response.data.some(
        (product: Product) =>
          product.active &&
          product.default_price &&
          product.default_price.unit_amount === price * 100 && 
          product.default_price.currency === currency &&
          product.default_price.recurring?.interval === interval &&
          product.id !== productId
      );
    } catch (error) {
      console.error('Error checking product price:', error);
      return false;
    }
  };

  const validateForm = async (): Promise<boolean> => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Product name cannot exceed 50 characters';
    } else {
      const nameExists = await checkProductNameExists(formData.name.trim(), formData.productId);
      if (nameExists) {
        newErrors.name = 'A plan with this name already exists';
      }
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price)) {
      newErrors.price = 'Price must be a valid number';
    } else if (price < 1) {
      newErrors.price = 'Price must be at least ₹1';
    } else if (price > 100000) {
      newErrors.price = 'Price cannot exceed ₹100,000';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must have up to 2 decimal places';
    } else {
      const priceExists = await checkProductPriceExists(
        price,
        formData.currency,
        formData.interval,
        formData.productId
      );
      if (priceExists) {
        newErrors.price = `A ${formData.interval}ly plan with price ${getCurrencySymbol(formData.currency)}${price.toFixed(2)} already exists`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!(await validateForm())) {
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) * 100, // Convert to cents
        currency: formData.currency,
        interval: formData.interval,
        ...(isEditing && formData.productId ? { id: formData.productId } : {}),
      };

      if (isEditing) {
        await updateSubscription(payload);
        toast.success('Plan updated successfully');
      } else {
        await createSubscription(payload);
        toast.success('Plan created successfully');
      }

      resetForm();
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || (isEditing ? 'Failed to update plan' : 'Failed to create plan')
          : (isEditing ? 'Failed to update plan' : 'Failed to create plan')
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.default_price ? (product.default_price.unit_amount / 100).toString() : '',
      currency: product.default_price?.currency || 'inr',
      interval: product.default_price?.recurring?.interval || 'month',
      productId: product.id,
    });
    setIsModalOpen(true);
  };

  const handleDeActivate = async (productId: string) => {
    try {
      setDeleting(productId);
      await deActivateSubscription(productId);
      toast.success('Plan deactivated successfully');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || 'Failed to deactivate plan'
          : 'Failed to deactivate plan'
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleActivate = async (productId: string) => {
    try {
      setDeleting(productId);
      await ActivateSubscription(productId);
      toast.success('Plan activated successfully');
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message || 'Failed to activate plan'
          : 'Failed to activate plan'
      );
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'inr',
      interval: 'month',
      productId: null,
    });
    setIsEditing(false);
    setErrors({});
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols = { inr: '₹', usd: '$', eur: '€' };
    return symbols[currency as keyof typeof symbols] || currency.toUpperCase();
  };

  const getIntervalColor = (interval?: string) => {
    switch (interval) {
      case 'month':
        return 'bg-emerald-100 text-emerald-800';
      case 'year':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Subscription Management
          </h1>
          <p className="text-slate-600">Create and manage your subscription plans with ease</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total plans</p>
                <p className="text-3xl font-bold text-slate-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Plans</p>
                <p className="text-3xl font-bold text-slate-900">
                  {products.filter(p => p.default_price?.recurring?.interval === 'month').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Yearly Plans</p>
                <p className="text-3xl font-bold text-slate-900">
                  {products.filter(p => p.default_price?.recurring?.interval === 'year').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Button
            type="primary"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Plan
          </Button>
        </div>

        <Modal
          title={
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              {isEditing ? 'Edit Plan' : 'Create New Plan'}
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            resetForm();
            setIsModalOpen(false);
          }}
          footer={null}
          width={800}
        >
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">Plan Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={50}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="Enter plan name"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">{formData.name.length}/50 characters</p>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-2">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${
                      errors.price ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                    placeholder="Enter price"
                    aria-describedby={errors.price ? 'price-error' : undefined}
                  />
                </div>
                {errors.price && (
                  <p id="price-error" className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.price}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">Range: {getCurrencySymbol(formData.currency)}1 - {getCurrencySymbol(formData.currency)}100,000</p>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-semibold text-slate-700 mb-2">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-slate-400"
                  aria-label="Select currency"
                >
                  <option value="inr">🇮🇳 INR - Indian Rupee</option>
                  <option value="usd">🇺🇸 USD - US Dollar</option>
                  <option value="eur">🇪🇺 EUR - Euro</option>
                </select>
              </div>

              <div>
                <label htmlFor="interval" className="block text-sm font-semibold text-slate-700 mb-2">Billing Interval</label>
                <select
                  id="interval"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-slate-400"
                  aria-label="Select billing interval"
                >
                  <option value="month">📅 Monthly</option>
                  <option value="year">📆 Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="Enter plan description (optional)"
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">{formData.description.length}/500 characters</p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="primary"
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {submitting ? 'Processing...' : isEditing ? 'Update Plan' : 'Create Plan'}
              </Button>
              <Button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                disabled={submitting}
                className={`px-8 py-3 bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-300 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-300'
                }`}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              Your Plans
            </h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-600">Loading plans...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg">No plans found</p>
              <p className="text-slate-500 text-sm mt-1">Create your first subscription plan to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 truncate flex-1 mr-2">
                      {product.name || 'Unnamed Product'}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getIntervalColor(product.default_price?.recurring?.interval)}`}>
                      {product.default_price?.recurring?.interval || 'One-time'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    {product.default_price ? (
                      <>
                        <p className="text-3xl font-bold text-slate-900">
                          {getCurrencySymbol(product.default_price.currency)}
                          {(product.default_price.unit_amount / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 uppercase tracking-wide">
                          {product.default_price.currency} / {product.default_price.recurring?.interval || 'once'}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-red-600">Price information unavailable</p>
                    )}
                  </div>
                  
                  {product.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      disabled={product.active === false}
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-4 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-lg hover:bg-indigo-200 transition-all duration-300 disabled:opacity-20"
                      aria-label={`Edit plan ${product.name || 'Unnamed Product'}`}
                    >
                      Edit
                    </button>

                    {product.active ? (
                      <Popconfirm
                        title="Manage Plan"
                        description="Are you sure you want to deactivate this plan?"
                        onConfirm={() => handleDeActivate(product.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          className={`flex-1 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg transition-all duration-300 ${
                            deleting === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-200'
                          }`}
                          aria-label={`Deactivate plan ${product.name || 'Unnamed Product'}`}
                        >
                          {deleting === product.id ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      </Popconfirm>
                    ) : (
                      <Popconfirm
                        title="Manage Plan"
                        description="Are you sure you want to activate this plan?"
                        onConfirm={() => handleActivate(product.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          className={`flex-1 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg transition-all duration-300 ${
                            deleting === product.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-200'
                          }`}
                          aria-label={`Activate plan ${product.name || 'Unnamed Product'}`}
                        >
                          {deleting === product.id ? 'Activating...' : 'Activate'}
                        </button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;