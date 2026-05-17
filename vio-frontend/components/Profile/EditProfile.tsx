import React, { useState } from "react";
import { User } from "../../types/chat";
import { Save, X, Loader2 } from "lucide-react";

interface EditProfileProps {
  user: User;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    description: user.description || "",
    statusText: user.statusText || "",
    phone: user.phone || "",
    status: user.status || "online",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Status Message</label>
          <div className="relative">
            <input
              type="text"
              value={formData.statusText}
              onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
              placeholder="What are you up to?"
              maxLength={100}
              className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
            <span className="absolute right-3 bottom-[-20px] text-[10px] text-slate-500">
              {formData.statusText.length}/100
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 mt-4">Bio / Description</label>
          <div className="relative">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={500}
              placeholder="Tell us about yourself..."
              className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600 resize-none"
            />
            <span className="absolute right-3 bottom-[-20px] text-[10px] text-slate-500">
              {formData.description.length}/500
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-2xl transition-all font-semibold shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
