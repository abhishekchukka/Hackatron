"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { db } from "../utils/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

const steps = [
  "Personal Details",
  "Contact Information",
  "Professional Details",
  "Verification",
  "Additional Info",
  "Authentication",
  "Review"
];

const defaultValues = {
  // Personal Details
  fullName: "",
  dateOfBirth: null,
  gender: "",
  nationality: "",
  profilePicture: "",

  // Contact Information
  email: "",
  phone: "",
  address: "",

  // Professional Details
  primarySport: "",
  yearsExperience: "",
  coachingLevel: "",
  certifications: "",
  currentAffiliation: "",
  achievements: "",

  // Verification
  idProof: "",
  coachingCertification: "",
  linkedinProfile: "",

  // Additional Information
  coachingPhilosophy: "",
  preferredAgeGroups: [],
  availability: {
    partTime: false,
    fullTime: false,
    flexible: false
  },

  // Authentication
  password: "",
  confirmPassword: "",
  termsAgreed: false
};

const CoachSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultValues);
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue,
    reset,
    trigger 
  } = useForm({
    defaultValues,
    mode: "onChange"
  });

  const router = useRouter();

  // Reset form when component mounts
  useEffect(() => {
    // Reset only the fields for the current step
    const stepFields = getStepFields(currentStep);
    reset(stepFields);
  }, [currentStep, reset, formData]);

  // Add this function before the handleNextStep function
  const getStepFields = (step) => {
    switch(step) {
      case 0: // Personal Details
        return {
          fullName: formData.fullName ?? "",
          dateOfBirth: formData.dateOfBirth ?? null,
          gender: formData.gender ?? "",
          nationality: formData.nationality ?? "",
          profilePicture: formData.profilePicture ?? ""
        };
      case 1: // Contact Information
        return {
          email: formData.email ?? "",
          phone: formData.phone ?? "",
          address: formData.address ?? ""
        };
      case 2: // Professional Details
        return {
          primarySport: formData.primarySport ?? "",
          yearsExperience: formData.yearsExperience ?? "",
          coachingLevel: formData.coachingLevel ?? "",
          certifications: formData.certifications ?? "",
          currentAffiliation: formData.currentAffiliation ?? "",
          achievements: formData.achievements ?? ""
        };
      case 3: // Verification
        return {
          idProof: formData.idProof ?? "",
          coachingCertification: formData.coachingCertification ?? "",
          linkedinProfile: formData.linkedinProfile ?? ""
        };
      case 4: // Additional Information
        return {
          coachingPhilosophy: formData.coachingPhilosophy ?? "",
          preferredAgeGroups: formData.preferredAgeGroups ?? [],
          availability: {
            partTime: formData.availability?.partTime ?? false,
            fullTime: formData.availability?.fullTime ?? false,
            flexible: formData.availability?.flexible ?? false
          }
        };
      case 5: // Authentication
        return {
          password: formData.password ?? "",
          confirmPassword: formData.confirmPassword ?? "",
          termsAgreed: formData.termsAgreed ?? false
        };
      case 6: // Review
        return formData;
      default:
        return {};
    }
  };

  // Validate current step before proceeding
  const handleNextStep = async () => {
    let fieldsToValidate = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['fullName', 'dateOfBirth', 'gender', 'nationality'];
        break;
      case 1:
        fieldsToValidate = ['email', 'phone'];
        break;
      case 2:
        fieldsToValidate = ['primarySport', 'yearsExperience', 'coachingLevel'];
        break;
      case 3:
        fieldsToValidate = ['idProof', 'coachingCertification', 'linkedinProfile'];
        break;
      // Add validation for other steps as needed
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      const stepData = watch();
      setFormData(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(stepData).map(([key, value]) => [key, value ?? ""])
        )
      }));
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleAgeGroupChange = (value, onChange, currentValues) => {
    const values = currentValues || [];
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange(newValues);
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Create a clean data object for submission
      const submissionData = {
        ...data,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : "",
        preferredAgeGroups: data.preferredAgeGroups || [],
        availability: {
          partTime: Boolean(data.availability?.partTime),
          fullTime: Boolean(data.availability?.fullTime),
          flexible: Boolean(data.availability?.flexible)
        },
        status: "pending", // Add status for coach approval
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Remove confirmPassword from stored data
      delete submissionData.confirmPassword;

      // Create a reference to the coaches collection and the specific document
      const coachesRef = collection(db, "coaches");
      const coachDoc = doc(coachesRef, data.email);

      // Store the data in Firestore
      await setDoc(coachDoc, submissionData);

      toast.success("Registration successful! Please wait for admin approval.");
      
      // Optional: Redirect to a success page or login page
      // router.push('/login');
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Personal Details</h2>
            <div className="grid gap-4">
              <Controller
                name="fullName"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <Label>Full Name</Label>
                    <Input 
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <span className="text-sm text-red-500">{errors.fullName.message}</span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="dateOfBirth"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <YearMonthPicker field={field} label="Date of Birth" />
                )}
              />

              <Controller
                name="gender"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <Label>Gender</Label>
                    <Select 
                      value={field.value ?? ""} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <span className="text-sm text-red-500">{errors.gender.message}</span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="nationality"
                control={control}
                rules={{ required: "Nationality is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Nationality</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="profilePicture"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Profile Picture URL</Label>
                    <Input 
                      placeholder="Enter profile picture URL"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            <div className="grid gap-4">
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                }}
                render={({ field }) => (
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="Enter your email" {...field} />
                    {errors.email && (
                      <span className="text-sm text-red-500">{errors.email.message}</span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="phone"
                control={control}
                rules={{ required: "Phone number is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="Enter your phone number" {...field} />
                    {errors.phone && (
                      <span className="text-sm text-red-500">{errors.phone.message}</span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Address</Label>
                    <Textarea 
                      placeholder="Enter your address"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Professional Details</h2>
            <div className="grid gap-4">
              <Controller
                name="primarySport"
                control={control}
                rules={{ required: "Primary sport is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Primary Sport</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cricket">Cricket</SelectItem>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="badminton">Badminton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="yearsExperience"
                control={control}
                rules={{ required: "Years of experience is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Years of Experience</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select years of experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-3">1-3 years</SelectItem>
                        <SelectItem value="4-6">4-6 years</SelectItem>
                        <SelectItem value="7-10">7-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="coachingLevel"
                control={control}
                rules={{ required: "Coaching level is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Coaching Level</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select coaching level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="certifications"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Certifications & Licenses (URLs)</Label>
                    <Textarea 
                      placeholder="Enter certification URLs (one per line)"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </div>
                )}
              />

              <Controller
                name="currentAffiliation"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Current Coaching Affiliation</Label>
                    <Input 
                      placeholder="Current club, academy, or institution"
                      {...field}
                    />
                  </div>
                )}
              />

              <Controller
                name="achievements"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Achievements</Label>
                    <Textarea 
                      placeholder="List your major achievements and accomplishments"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Verification & Credentials</h2>
            <div className="grid gap-4">
              <Controller
                name="idProof"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <Label>Government ID Proof URL</Label>
                    <Input 
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Enter ID document URL"
                    />
                    <p className="text-sm text-gray-500 mt-1">URL to Aadhaar, Passport, or other valid ID</p>
                  </div>
                )}
              />

              <Controller
                name="coachingCertification"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <Label>Coaching Certification URL</Label>
                    <Input 
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Enter certification document URL"
                    />
                    <p className="text-sm text-gray-500 mt-1">URL to your coaching certificates</p>
                  </div>
                )}
              />

              <Controller
                name="linkedinProfile"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div>
                    <Label>LinkedIn Profile URL</Label>
                    <Input 
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Additional Information</h2>
            <div className="grid gap-4">
              <Controller
                name="coachingPhilosophy"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Coaching Philosophy</Label>
                    <Textarea 
                      placeholder="Describe your coaching approach and philosophy"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </div>
                )}
              />

              <div>
                <Label>Preferred Age Groups</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Controller
                    name="preferredAgeGroups"
                    control={control}
                    defaultValue={[]}
                    render={({ field: { onChange, value } }) => (
                      <>
                        {[
                          { id: 'kids', label: 'Kids (5-12)' },
                          { id: 'teens', label: 'Teens (13-19)' },
                          { id: 'adults', label: 'Adults (20+)' },
                          { id: 'pros', label: 'Professional Athletes' }
                        ].map(({ id, label }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={id}
                              checked={(value || []).includes(id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked 
                                  ? [...(value || []), id]
                                  : (value || []).filter(v => v !== id);
                                onChange(newValue);
                              }}
                            />
                            <Label htmlFor={id}>{label}</Label>
                          </div>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label>Availability</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { id: 'partTime', label: 'Part-time' },
                    { id: 'fullTime', label: 'Full-time' },
                    { id: 'flexible', label: 'Flexible Hours' }
                  ].map(({ id, label }) => (
                    <Controller
                      key={id}
                      name={`availability.${id}`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                          <Label htmlFor={id}>{label}</Label>
                        </div>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Authentication & Agreement</h2>
            <div className="grid gap-4">
              <Controller
                name="password"
                control={control}
                rules={{ 
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                }}
                render={({ field }) => (
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Enter your password"
                      {...field}
                    />
                    {errors.password && (
                      <span className="text-sm text-red-500">{errors.password.message}</span>
                    )}
                  </div>
                )}
              />

              <Controller
                name="termsAgreed"
                control={control}
                rules={{ required: "You must agree to the terms and conditions" }}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                    <Label>I agree to terms</Label>
                    {errors.termsAgreed && (
                      <span className="text-sm text-red-500">{errors.termsAgreed.message}</span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 6:
        const formData = watch();
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Information</h2>
            <div className="grid gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Personal Details</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.fullName || 'Not provided'}</p>
                  <p><span className="font-medium">Email:</span> {formData.email || 'Not provided'}</p>
                  <p><span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}</p>
                  <p><span className="font-medium">Gender:</span> {formData.gender || 'Not provided'}</p>
                  <p><span className="font-medium">Nationality:</span> {formData.nationality || 'Not provided'}</p>
                  <p>
                    <span className="font-medium">Date of Birth:</span> 
                    {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Professional Information</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Primary Sport:</span> {formData.primarySport || 'Not provided'}</p>
                  <p><span className="font-medium">Experience:</span> {formData.yearsExperience || 'Not provided'}</p>
                  <p><span className="font-medium">Coaching Level:</span> {formData.coachingLevel || 'Not provided'}</p>
                  <p><span className="font-medium">Current Affiliation:</span> {formData.currentAffiliation || 'Not provided'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Part-time:</span> {formData.availability?.partTime ? "Yes" : "No" || 'Not provided'}</p>
                  <p><span className="font-medium">Full-time:</span> {formData.availability?.fullTime ? "Yes" : "No" || 'Not provided'}</p>
                  <p><span className="font-medium">Flexible Hours:</span> {formData.availability?.flexible ? "Yes" : "No" || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Create a YearMonthPicker component for better date selection
  const YearMonthPicker = ({ field, label }) => {
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Ensure the date is properly parsed
    const selectedDate = field.value ? (field.value instanceof Date ? field.value : new Date(field.value)) : null;
    const [selectedYear, setSelectedYear] = useState(selectedDate?.getFullYear() || null);
    const [selectedMonth, setSelectedMonth] = useState(selectedDate?.getMonth() || null);

    // Update state when field value changes
    useEffect(() => {
      const date = field.value ? (field.value instanceof Date ? field.value : new Date(field.value)) : null;
      setSelectedYear(date?.getFullYear() || null);
      setSelectedMonth(date?.getMonth() || null);
    }, [field.value]);

    // Validate date before using it
    const isValidDate = (date) => date instanceof Date && !isNaN(date);

    return (
      <div>
        <Label>{label}</Label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Select
            value={selectedYear?.toString() ?? ""}
            onValueChange={(year) => {
              const yearNum = parseInt(year);
              setSelectedYear(yearNum);
              if (selectedMonth !== null) {
                const newDate = new Date(yearNum, selectedMonth, 1);
                if (isValidDate(newDate)) {
                  field.onChange(newDate);
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedMonth?.toString() ?? ""}
            onValueChange={(month) => {
              const monthIndex = parseInt(month);
              setSelectedMonth(monthIndex);
              if (selectedYear !== null) {
                const newDate = new Date(selectedYear, monthIndex, 1);
                if (isValidDate(newDate)) {
                  field.onChange(newDate);
                }
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value && isValidDate(new Date(field.value)) 
                ? format(new Date(field.value), "PPP") 
                : <span>Pick a date</span>
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={field.value && isValidDate(new Date(field.value)) ? new Date(field.value) : null}
              onSelect={(date) => {
                field.onChange(date);
                if (date && isValidDate(date)) {
                  setSelectedYear(date.getFullYear());
                  setSelectedMonth(date.getMonth());
                }
              }}
              defaultMonth={selectedYear && selectedMonth !== null ? new Date(selectedYear, selectedMonth) : undefined}
              disabled={(date) =>
                date > new Date() || date < new Date(years[years.length - 1], 0, 1)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Coach Registration</h1>
        <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          {steps.map((step, index) => (
            <span
              key={step}
              className={cn(
                "transition-colors",
                currentStep >= index ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {renderStep()}

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>
          <Button
            type={currentStep === steps.length - 1 ? "submit" : "button"}
            onClick={currentStep === steps.length - 1 ? undefined : handleNextStep}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? "Submitting..." 
              : currentStep === steps.length - 1 
                ? "Submit" 
                : "Next"
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CoachSignup;
