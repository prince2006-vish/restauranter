import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Award } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/admin');
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (rev) => {
    try {
      const res = await api.patch(`/reviews/admin/${rev._id}`, {
        isApproved: !rev.isApproved,
      });
      if (res.data.success) {
        toast.success(`Review ${!rev.isApproved ? 'approved for website' : 'hidden'}`);
        setReviews((prev) =>
          prev.map((r) => (r._id === rev._id ? { ...r, isApproved: !rev.isApproved } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update review status');
    }
  };

  const handleToggleFeatured = async (rev) => {
    try {
      const res = await api.patch(`/reviews/admin/${rev._id}`, {
        isFeatured: !rev.isFeatured,
      });
      if (res.data.success) {
        toast.success(`Review ${!rev.isFeatured ? 'featured on homepage' : 'unfeatured'}`);
        setReviews((prev) =>
          prev.map((r) => (r._id === rev._id ? { ...r, isFeatured: !rev.isFeatured } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to toggle featured status');
    }
  };

  const handleDeleteReview = async (rev) => {
    if (!window.confirm(`Delete review from "${rev.customerName}"?`)) return;
    try {
      const res = await api.delete(`/reviews/admin/${rev._id}`);
      if (res.data.success) {
        toast.success('Review deleted');
        setReviews((prev) => prev.filter((r) => r._id !== rev._id));
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-[#12372A]">Customer Feedback Moderation</h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Approve, feature, or remove customer ratings submitted through the website
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-stone-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">No customer reviews submitted yet.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/60">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">{rev.customerName}</span>
                    <div className="flex items-center text-[#D4AF37]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.dishMentioned && (
                      <span className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                        {rev.dishMentioned}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed italic">"{rev.comment}"</p>

                  <div className="flex items-center gap-3 text-[10px] text-stone-400">
                    <span>Submitted: {new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {rev.isApproved ? 'Approved & Public' : 'Pending Approval'}
                    </span>
                    {rev.isFeatured && (
                      <span className="bg-[#12372A] text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                        Featured on Homepage
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleApproval(rev)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                      rev.isApproved
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{rev.isApproved ? 'Hide' : 'Approve'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(rev)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                      rev.isFeatured
                        ? 'bg-[#12372A] text-[#D4AF37] border-[#12372A]'
                        : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                    title="Feature on homepage"
                  >
                    <Award className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteReview(rev)}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-colors"
                    title="Delete review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
