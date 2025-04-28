import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { z } from "zod";
import PasswordInput from '../../sharedComponents/PasswordInput'; 

// Schema for change password validation
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, "invalid password")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[@$!%*?&#]/, "Include at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwordData: PasswordData) => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

const ChangePasswordModal = ({ isOpen, onClose, onSave }: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChangePasswordData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof ChangePasswordData, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  useEffect(() => {
    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangePasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = changePasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangePasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangePasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({
        currentPassword: true,
        newPassword: true,
        confirmPassword: true,
      });
      return;
    }

    onSave(formData);
    onClose();
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setTouched({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fadeIn">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">

            {/* Current Password */}
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={touched.currentPassword ? errors.currentPassword :""}
            />

            {/* New Password */}
            <PasswordInput
              id="newPassword"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={touched.newPassword ? errors.newPassword:""}
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={touched.confirmPassword ? errors.confirmPassword : ""}
              

            />

          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
