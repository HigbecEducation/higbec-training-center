// app/register/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "qrcode";
import {
  ArrowLeft,
  Plus,
  Minus,
  CheckCircle,
  User,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
  UserPlus,
  Award,
  AlertCircle,
  CreditCard,
  Upload,
  QrCode,
  IndianRupee,
  Copy,
  Check,
} from "lucide-react";

// Enhanced Validation Schema with payment screenshot
const registrationSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(255, "Full name must not exceed 255 characters")
      .regex(
        /^[a-zA-Z\s.'-]+$/,
        "Full name can only contain letters, spaces, dots, apostrophes, and hyphens"
      ),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits")
      .regex(/^[+]?[0-9\s()-]+$/, "Please enter a valid phone number"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters"),
    collegeName: z
      .string()
      .min(2, "College name is required")
      .max(255, "College name must not exceed 255 characters"),
    branch: z
      .string()
      .min(2, "Branch is required")
      .max(255, "Branch must not exceed 255 characters"),
    semester: z
      .string()
      .min(1, "Semester is required")
      .max(50, "Semester must not exceed 50 characters"),
    batchType: z.enum(
      ["M.Tech", "B.Tech", "M.Sc.", "B.Sc.", "Polytechnic", "MCA", "Diploma"],
      {
        errorMap: () => ({ message: "Please select a valid batch type" }),
      }
    ),
    registrationType: z.enum(["Individual Project", "Group Project"], {
      errorMap: () => ({ message: "Please select a registration type" }),
    }),
    projectTitle: z
      .string()
      .min(5, "Project title must be at least 5 characters")
      .max(500, "Project title must not exceed 500 characters"),
    groupMembers: z
      .array(
        z.object({
          name: z
            .string()
            .min(2, "Member name is required")
            .max(255, "Member name must not exceed 255 characters")
            .regex(
              /^[a-zA-Z\s.'-]+$/,
              "Name can only contain letters, spaces, dots, apostrophes, and hyphens"
            ),
          phoneNumber: z
            .string()
            .min(10, "Member phone number is required")
            .max(15, "Phone number must not exceed 15 digits")
            .regex(/^[+]?[0-9\s()-]+$/, "Please enter a valid phone number"),
        })
      )
      .max(5, "Maximum 5 group members allowed")
      .optional(),
    paymentScreenshot: z
      .any()
      .refine((file) => {
        // Check if it's a FileList or File
        if (file instanceof FileList) {
          return file.length > 0;
        }
        if (file instanceof File) {
          return true;
        }
        return false;
      }, "Payment screenshot is required")
      .refine((file) => {
        // Get the actual file
        const actualFile = file instanceof FileList ? file[0] : file;
        return actualFile && actualFile.size <= 5000000;
      }, "File size should be less than 5MB")
      .refine((file) => {
        // Get the actual file
        const actualFile = file instanceof FileList ? file[0] : file;
        return (
          actualFile &&
          ["image/jpeg", "image/jpg", "image/png"].includes(actualFile.type)
        );
      }, "Only JPG, JPEG and PNG files are allowed"),
  })
  .refine(
    (data) => {
      if (data.registrationType === "Group Project") {
        return data.groupMembers && data.groupMembers.length > 0;
      }
      return true;
    },
    {
      message: "At least one group member is required for group projects",
      path: ["groupMembers"],
    }
  );

const batchOptions = [
  "M.Tech",
  "B.Tech",
  "M.Sc.",
  "B.Sc.",
  "Polytechnic",
  "MCA",
  "Diploma",
];

// Updated payment details
const PAYMENT_DETAILS = {
  amount: 4000,
  upiId: "vyapar.173204604992@hdfcbank", // Updated UPI ID
  merchantName: "HIGBEC PVT LTD", // Updated merchant name
  qrCodeUrl:
    "data:image/png;base64,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",
};

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const totalSteps = 4; // Updated to 4 steps

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      groupMembers: [],
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "groupMembers",
  });

  const watchRegistrationType = watch("registrationType");

  // Real-time validation helpers
  const hasErrors = (fieldNames) => {
    return fieldNames.some((field) => errors[field]);
  };

  // Copy UPI ID to clipboard
  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_DETAILS.upiId);
      setUpiIdCopied(true);
      toast.success("UPI ID copied to clipboard!");
      setTimeout(() => setUpiIdCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy UPI ID");
    }
  };

  // Fixed file upload handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > 5000000) {
        toast.error("File size should be less than 5MB");
        event.target.value = ""; // Clear the input
        return;
      }

      // Validate file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Only JPG, JPEG and PNG files are allowed");
        event.target.value = ""; // Clear the input
        return;
      }

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setUploadedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Update form value - set the file directly, not FileList
      setValue("paymentScreenshot", file);
      clearErrors("paymentScreenshot");

      toast.success("Screenshot uploaded successfully!");
    }
  };

  // Remove uploaded file
  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setValue("paymentScreenshot", null);

    // Reset file input
    const fileInput = document.getElementById("paymentScreenshot");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Generate QR Code on component mount
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // UPI payment string format
        const upiString = `upi://pay?pa=${
          PAYMENT_DETAILS.upiId
        }&pn=${encodeURIComponent(PAYMENT_DETAILS.merchantName)}&am=${
          PAYMENT_DETAILS.amount
        }&cu=INR`;
        const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, []);

  // Generate QR Code on component mount
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // UPI payment string format
        const upiString = `upi://pay?pa=${
          PAYMENT_DETAILS.upiId
        }&pn=${encodeURIComponent(PAYMENT_DETAILS.merchantName)}&am=${
          PAYMENT_DETAILS.amount
        }&cu=INR`;
        const qrCodeDataUrl = await QRCode.toDataURL(upiString, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(qrCodeDataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, []);

  // Clean up preview URL on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Step Navigation with enhanced validation
  const nextStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === 1) {
      fieldsToValidate = ["fullName", "phoneNumber", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["collegeName", "branch", "semester", "batchType"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["registrationType", "projectTitle"];

      // Add group members validation if it's a group project
      if (watchRegistrationType === "Group Project") {
        fieldsToValidate.push("groupMembers");
      }
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show specific errors for invalid fields
      fieldsToValidate.forEach((field) => {
        if (errors[field]) {
          toast.error(
            `Please fix the error in ${field
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`
          );
        }
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enhanced form submission with better error handling
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitAttempted(true);

    try {
      // Final validation
      const isValid = await trigger();
      if (!isValid) {
        toast.error("Please fix all validation errors before submitting");
        setIsSubmitting(false);
        return;
      }

      // Validate payment screenshot specifically
      if (!uploadedFile) {
        toast.error("Please upload payment screenshot");
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Clean phone numbers (remove non-numeric characters except +)
      const cleanedData = {
        ...data,
        phoneNumber: data.phoneNumber.replace(/[^\d+]/g, ""),
        groupMembers:
          data.groupMembers?.map((member) => ({
            ...member,
            phoneNumber: member.phoneNumber.replace(/[^\d+]/g, ""),
          })) || [],
      };

      // Append all form data except the file
      Object.keys(cleanedData).forEach((key) => {
        if (key !== "paymentScreenshot") {
          if (key === "groupMembers") {
            formData.append(key, JSON.stringify(cleanedData[key]));
          } else {
            formData.append(key, cleanedData[key]);
          }
        }
      });

      // Append the payment screenshot file
      formData.append("paymentScreenshot", uploadedFile);

      const response = await fetch("/api/register", {
        method: "POST",
        body: formData, // Using FormData instead of JSON
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Redirecting...", {
          duration: 2000,
          icon: "🎉",
        });

        // Clean up preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        // Redirect to success page after a delay
        setTimeout(() => {
          router.push(
            `/register/success?id=${result.id}&projectId=${result.projectId}`
          );
        }, 2000);
      } else {
        // Handle different types of errors
        if (response.status === 409) {
          toast.error(
            "This email is already registered. Please use a different email address."
          );
        } else if (response.status === 400) {
          toast.error(
            result.message || "Please check your input and try again."
          );
        } else {
          toast.error("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error(
          "Network error. Please check your connection and try again."
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced group member management
  const addGroupMember = () => {
    if (fields.length >= 5) {
      toast.error("Maximum 5 group members allowed");
      return;
    }
    append({ name: "", phoneNumber: "" });
    toast.success("Group member added");
  };

  const removeGroupMember = (index) => {
    remove(index);
    toast.success("Group member removed");
  };

  // Auto-save functionality (commented out as requested in original)
  const autoSaveData = () => {
    // Implementation removed to prevent re-renders
  };

  // Progress Bar Component with enhanced styling
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                step < currentStep
                  ? "bg-green-500 text-white shadow-lg"
                  : step === currentStep
                  ? "bg-blue-500 text-white shadow-lg animate-pulse"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
            </div>
            {step < 4 && (
              <div
                className={`flex-1 h-2 mx-4 rounded-full transition-all duration-300 ${
                  step < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-600 font-medium">
          Step {currentStep} of {totalSteps}:{" "}
          {currentStep === 1
            ? "Personal Information"
            : currentStep === 2
            ? "Academic Details"
            : currentStep === 3
            ? "Project Information"
            : "Payment"}
        </span>
      </div>
    </div>
  );

  // Step One Component
  const StepOne = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="form-group">
        <label className="form-label flex items-center">
          <User className="w-4 h-4 mr-2" />
          Full Name <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          className={`form-input ${
            errors.fullName
              ? "border-red-500 ring-red-200"
              : "focus:ring-blue-200"
          }`}
          placeholder="Enter your full name"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label flex items-center">
          <Phone className="w-4 h-4 mr-2" />
          Phone Number (WhatsApp) <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="tel"
          className={`form-input ${
            errors.phoneNumber
              ? "border-red-500 ring-red-200"
              : "focus:ring-blue-200"
          }`}
          placeholder="Enter your WhatsApp number"
          {...register("phoneNumber")}
        />
        {errors.phoneNumber && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phoneNumber.message}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          We'll use this number to contact you via WhatsApp
        </p>
      </div>

      <div className="form-group">
        <label className="form-label flex items-center">
          <Mail className="w-4 h-4 mr-2" />
          Email Address <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="email"
          className={`form-input ${
            errors.email ? "border-red-500 ring-red-200" : "focus:ring-blue-200"
          }`}
          placeholder="Enter your email address"
          {...register("email")}
        />
        {errors.email && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>
    </motion.div>
  );

  // Step Two Component
  const StepTwo = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Academic Information
        </h2>
        <p className="text-gray-600">
          Tell us about your educational background
        </p>
      </div>

      <div className="form-group">
        <label className="form-label flex items-center">
          <GraduationCap className="w-4 h-4 mr-2" />
          College/School Name <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          className={`form-input ${
            errors.collegeName
              ? "border-red-500 ring-red-200"
              : "focus:ring-blue-200"
          }`}
          placeholder="Enter your college or school name"
          {...register("collegeName")}
        />
        {errors.collegeName && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.collegeName.message}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Branch <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${
              errors.branch
                ? "border-red-500 ring-red-200"
                : "focus:ring-blue-200"
            }`}
            placeholder="e.g., Computer Science"
            {...register("branch")}
          />
          {errors.branch && (
            <p className="form-error flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.branch.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Semester <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            className={`form-input ${
              errors.semester
                ? "border-red-500 ring-red-200"
                : "focus:ring-blue-200"
            }`}
            placeholder="e.g., 6th Semester"
            {...register("semester")}
          />
          {errors.semester && (
            <p className="form-error flex items-center mt-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.semester.message}
            </p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Batch Type <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          className={`form-input ${
            errors.batchType
              ? "border-red-500 ring-red-200"
              : "focus:ring-blue-200"
          }`}
          {...register("batchType")}
        >
          <option value="">Select your batch type</option>
          {batchOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.batchType && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.batchType.message}
          </p>
        )}
      </div>
    </motion.div>
  );

  // Step Three Component
  const StepThree = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-purple-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Project Details
        </h2>
        <p className="text-gray-600">Tell us about your project requirements</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Registration Type <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
              watchRegistrationType === "Individual Project"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              value="Individual Project"
              className="mr-3 text-blue-600"
              {...register("registrationType")}
              onChange={(e) => {
                register("registrationType").onChange(e);
                // Clear group members when switching to individual
                if (e.target.value === "Individual Project") {
                  setValue("groupMembers", []);
                }
                autoSaveData();
              }}
            />
            <div>
              <div className="flex items-center mb-1">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-semibold">Individual Project</span>
              </div>
              <p className="text-sm text-gray-600">
                Work on your project independently
              </p>
            </div>
          </label>

          <label
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
              watchRegistrationType === "Group Project"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              value="Group Project"
              className="mr-3 text-blue-600"
              {...register("registrationType")}
              onChange={(e) => {
                register("registrationType").onChange(e);
                autoSaveData();
              }}
            />
            <div>
              <div className="flex items-center mb-1">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-semibold">Group Project</span>
              </div>
              <p className="text-sm text-gray-600">
                Collaborate with team members
              </p>
            </div>
          </label>
        </div>
        {errors.registrationType && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.registrationType.message}
          </p>
        )}
      </div>

      <div className="form-group">
        <label className="form-label flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Project Title <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          className={`form-input ${
            errors.projectTitle
              ? "border-red-500 ring-red-200"
              : "focus:ring-blue-200"
          }`}
          placeholder="Enter your project title"
          {...register("projectTitle")}
          onChange={(e) => {
            register("projectTitle").onChange(e);
            autoSaveData();
          }}
        />
        {errors.projectTitle && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.projectTitle.message}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Provide a clear and descriptive title for your project
        </p>
      </div>

      {/* Enhanced Group Members Section */}
      {watchRegistrationType === "Group Project" && (
        <div className="form-group">
          <div className="flex items-center justify-between mb-4">
            <label className="form-label flex items-center mb-0">
              <UserPlus className="w-4 h-4 mr-2" />
              Group Members <span className="text-red-500 ml-1">*</span>
              <span className="text-sm text-gray-500 ml-2">
                (Max 5 members)
              </span>
            </label>
            <button
              type="button"
              onClick={addGroupMember}
              disabled={fields.length >= 5}
              className={`btn-secondary text-sm py-2 px-4 flex items-center ${
                fields.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Member
            </button>
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <UserPlus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">
                No group members added yet
              </p>
              <p className="text-sm text-gray-500">
                Click "Add Member" to add your team members
              </p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Member {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeGroupMember(index)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-300 p-1 rounded-full hover:bg-red-100"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${
                        errors.groupMembers?.[index]?.name
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Member name"
                      {...register(`groupMembers.${index}.name`)}
                      onChange={(e) => {
                        register(`groupMembers.${index}.name`).onChange(e);
                        autoSaveData();
                      }}
                    />
                    {errors.groupMembers?.[index]?.name && (
                      <p className="form-error flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.groupMembers[index].name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`form-input ${
                        errors.groupMembers?.[index]?.phoneNumber
                          ? "border-red-500"
                          : ""
                      }`}
                      placeholder="Member phone number"
                      {...register(`groupMembers.${index}.phoneNumber`)}
                      onChange={(e) => {
                        register(`groupMembers.${index}.phoneNumber`).onChange(
                          e
                        );
                        autoSaveData();
                      }}
                    />
                    {errors.groupMembers?.[index]?.phoneNumber && (
                      <p className="form-error flex items-center mt-1">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.groupMembers[index].phoneNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {errors.groupMembers &&
            typeof errors.groupMembers.message === "string" && (
              <p className="form-error flex items-center mt-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.groupMembers.message}
              </p>
            )}
        </div>
      )}
    </motion.div>
  );

  // New Step Four - Payment Component
  const StepFour = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment & Registration
        </h2>
        <p className="text-gray-600">
          Complete your payment to finalize the registration
        </p>
      </div>

      {/* Payment Amount Display */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
        <div className="flex items-center justify-center mb-2">
          <IndianRupee className="w-8 h-8 text-blue-600 mr-2" />
          <span className="text-3xl font-bold text-blue-600">
            {PAYMENT_DETAILS.amount.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="text-gray-600 font-medium">Registration Fee</p>
        <p className="text-sm text-gray-500 mt-1">
          One-time payment for project guidance and mentorship
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Payment Instructions
        </h3>
        <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
          <li>Scan the QR code below or use the UPI ID to make payment</li>
          <li>
            Enter the exact amount: ₹
            {PAYMENT_DETAILS.amount.toLocaleString("en-IN")}
          </li>
          <li>Complete the payment in your UPI app</li>
          <li>Take a screenshot of the successful payment</li>
          <li>Upload the screenshot below to complete registration</li>
        </ol>
      </div>

      {/* QR Code and UPI Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-center">
            <QrCode className="w-5 h-5 mr-2" />
            Scan QR Code
          </h3>
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 mx-auto border-2 border-white rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Generating QR Code...</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Scan this QR code with any UPI app to pay
          </p>
        </div>

        {/* UPI Details */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                UPI ID
              </label>
              <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3 mt-1">
                <span className="font-mono text-sm">
                  {PAYMENT_DETAILS.upiId}
                </span>
                <button
                  type="button"
                  onClick={copyUpiId}
                  className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
                  title="Copy UPI ID"
                >
                  {upiIdCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Merchant Name
              </label>
              <div className="bg-gray-50 border rounded-lg p-3 mt-1">
                <span className="text-sm">{PAYMENT_DETAILS.merchantName}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Amount
              </label>
              <div className="bg-gray-50 border rounded-lg p-3 mt-1">
                <span className="text-sm font-semibold">
                  ₹{PAYMENT_DETAILS.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Please ensure you enter the exact amount.
              Any discrepancy may delay your registration process.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload Section - Fixed */}
      <div className="form-group">
        <label className="form-label flex items-center">
          <Upload className="w-4 h-4 mr-2" />
          Upload Payment Screenshot <span className="text-red-500 ml-1">*</span>
        </label>

        {!uploadedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors duration-300">
            <input
              type="file"
              id="paymentScreenshot"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="paymentScreenshot" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Upload Payment Screenshot
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click to browse or drag and drop your screenshot here
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </div>
            </label>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Payment Screenshot Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    File uploaded successfully
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeUploadedFile}
                className="text-red-500 hover:text-red-700 transition-colors duration-300"
                title="Remove file"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {errors.paymentScreenshot && (
          <p className="form-error flex items-center mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.paymentScreenshot.message}
          </p>
        )}

        <div className="mt-2 text-sm text-gray-500">
          <p>• Accepted formats: JPG, JPEG, PNG</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Make sure the screenshot clearly shows the payment details</p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Important Notice
        </h3>
        <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
          <li>
            Registration will only be confirmed after payment verification
          </li>
          <li>Please keep the original payment screenshot for your records</li>
          <li>In case of payment issues, contact our support team</li>
          <li>Refunds are processed as per our refund policy</li>
        </ul>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4ade80",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Project <span className="text-gradient">Registration</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Register your project with HIGBEC and get expert guidance to build
            industry-ready solutions
          </p>
        </div>

        {/* Registration Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <ProgressBar />

            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && <StepOne />}
              {currentStep === 2 && <StepTwo />}
              {currentStep === 3 && <StepThree />}
              {currentStep === 4 && <StepFour />}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  className={`btn-secondary flex items-center ${
                    currentStep === 1 ? "invisible" : ""
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (hasErrors(["fullName", "phoneNumber", "email"]) &&
                        currentStep === 1) ||
                      (hasErrors([
                        "collegeName",
                        "branch",
                        "semester",
                        "batchType",
                      ]) &&
                        currentStep === 2) ||
                      (hasErrors(["registrationType", "projectTitle"]) &&
                        currentStep === 3)
                    }
                    className="btn-primary flex items-center"
                  >
                    Next Step
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !uploadedFile}
                    className={`btn-primary flex items-center min-w-[200px] justify-center ${
                      !uploadedFile ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Registration
                        <CheckCircle className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Information Cards */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Instant Registration</h3>
              <p className="text-sm text-gray-600">
                No account creation required. Register directly and get started
                immediately.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Expert Guidance</h3>
              <p className="text-sm text-gray-600">
                Get mentorship from industry experts throughout your project
                development.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Industry Ready</h3>
              <p className="text-sm text-gray-600">
                Build projects that meet industry standards and boost your
                career prospects.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-gray-600">
                Safe and secure UPI payment gateway with instant confirmation.
              </p>
            </div>
          </div>

          {/* Payment Security Notice */}
          {currentStep === 4 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    Secure Payment Process
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>
                      • All payments are processed through secure UPI gateway
                    </li>
                    <li>• Your payment details are encrypted and protected</li>
                    <li>
                      • You will receive email confirmation after successful
                      registration
                    </li>
                    <li>• Our team will verify your payment within 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
