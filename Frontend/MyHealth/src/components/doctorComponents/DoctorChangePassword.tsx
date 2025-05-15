import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { z } from "zod";
import PasswordInput from "../../sharedComponents/PasswordInput";

// Validation Schema
const changeDoctorPasswordSchema = z.object({
  currentPassword: z.string()
    .min(8, "Invalid password")
    .refine((val) => val.trim() === val, {
      message: "No leading or trailing spaces allowed",
    }),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[@$!%*?&#]/, "Include at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

interface ChangeDoctorPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passwordData: DoctorPasswordData) => void;
}

interface DoctorPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ChangeDoctorPasswordData = z.infer<typeof changeDoctorPasswordSchema>;

const ChangeDoctorPassword = ({ isOpen, onClose, onSave }: ChangeDoctorPasswordModalProps) => {
  const [formData, setFormData] = useState<ChangeDoctorPasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChangeDoctorPasswordData, string>>>({});
  const [touched, setTouched] = useState<Record<keyof ChangeDoctorPasswordData, boolean>>({
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
    const result = changeDoctorPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangeDoctorPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangeDoctorPasswordData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
    }
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = changeDoctorPasswordSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ChangeDoctorPasswordData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ChangeDoctorPasswordData;
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
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={touched.currentPassword ? errors.currentPassword : ""}
            />

            <PasswordInput
              id="newPassword"
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={touched.newPassword ? errors.newPassword : ""}
            />

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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeDoctorPassword;
