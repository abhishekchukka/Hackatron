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
import { Switch } from "@/components/ui/switch";
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
import { db, storage } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

const steps = [
  "Personal Information",
  "Athletic Background",
  "Physical Attributes",
  "Medical & Health",
  "Career Goals",
  "Social Media",
  "Review"
];

// Define defaultValues before the component
const defaultValues = {
  // Personal Information
  fullName: "",
  dateOfBirth: undefined,
  gender: "",
  email: "",
  phone: "",
  profilePicture: "",

  // Athletic Background
  primarySport: "",
  secondarySport: "",
  currentLevel: "",
  playingExperience: "0",
  achievements: "",
  currentClub: "",
  coachDetails: "",

  // Physical Attributes
  height: "0",
  weight: "0",
  dominantSide: "right",
  bloodGroup: "",
  fitnessLevel: "",

  // Medical & Health
  existingInjuries: false,
  medicalConditions: {
    asthma: false,
    diabetes: false,
    heartCondition: false,
    other: false
  },
  previousSurgeries: "",
  allergies: "",
  emergencyContact: {
    name: "",
    relationship: "",
    phone: ""
  },
  dietaryPreferences: "",
  fitnessCertificate: "",

  // Career & Goals
  careerGoal: "",
  lookingForCoach: false,
  lookingForTeam: false,
  interestedInSponsorships: false,

  // Social Media & Verification
  instagram: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  idProof: "",
  
  // Authentication
  password: "",
  dataConsent: false,
  termsAgreed: false
};

const PlayerSignup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultValues); // Store complete form data

  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    reset,
    trigger 
  } = useForm({
    defaultValues: {}, // Start with empty defaults
    mode: "onChange"
  });

  // Reset form when step changes
  useEffect(() => {
    // Get the default values for current step
    const stepDefaults = getStepFields(currentStep);
    reset(stepDefaults);
  }, [currentStep, reset]);

  // Function to get fields for each step
  const getStepFields = (step) => {
    switch(step) {
      case 0:
        return {
          fullName: formData.fullName || "",
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || "",
          email: formData.email || "",
          phone: formData.phone || "",
          profilePicture: formData.profilePicture || ""
        };
      case 1:
        return {
          primarySport: formData.primarySport || "",
          secondarySport: formData.secondarySport || "",
          currentLevel: formData.currentLevel || "",
          playingExperience: formData.playingExperience || "0",
          achievements: formData.achievements || "",
          currentClub: formData.currentClub || "",
          coachDetails: formData.coachDetails || ""
        };
      case 2:
        return {
          height: formData.height || "0",
          weight: formData.weight || "0",
          dominantSide: formData.dominantSide || "right"
        };
      case 3:
        return {
          existingInjuries: formData.existingInjuries || false,
          medicalConditions: formData.medicalConditions || { asthma: false, diabetes: false, heartCondition: false, other: false },
          previousSurgeries: formData.previousSurgeries || "",
          allergies: formData.allergies || "",
          emergencyContact: formData.emergencyContact || { name: "", relationship: "", phone: "" },
          dietaryPreferences: formData.dietaryPreferences || "",
          fitnessCertificate: formData.fitnessCertificate || ""
        };
      case 4:
        return {
          careerGoal: formData.careerGoal || "",
          lookingForCoach: formData.lookingForCoach || false,
          lookingForTeam: formData.lookingForTeam || false,
          interestedInSponsorships: formData.interestedInSponsorships || false
        };
      case 5:
        return {
          instagram: formData.instagram || "",
          twitter: formData.twitter || "",
          youtube: formData.youtube || "",
          linkedin: formData.linkedin || "",
          idProof: formData.idProof || "",
          password: formData.password || "",
          dataConsent: formData.dataConsent || false,
          termsAgreed: formData.termsAgreed || false
        };
      default:
        return {};
    }
  };

  // Handle next step with validation
  const handleNextStep = async () => {
    const fields = Object.keys(getStepFields(currentStep));
    const isStepValid = await trigger(fields);
    
    if (isStepValid) {
      // Save current step data
      const stepData = watch();
      setFormData(prev => ({
        ...prev,
        ...stepData
      }));
      
      // Move to next step
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Handle final submission
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Combine all data
      const finalData = {
        ...formData,
        ...data,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : "",
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        playingExperience: Number(formData.playingExperience) || 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      delete finalData.dataConsent;

      const playerRef = doc(db, "players", finalData.email);
      await setDoc(playerRef, finalData);

      toast.success("Registration successful! Please wait for approval.");
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
            <h2 className="text-2xl font-bold">Personal Information</h2>
            <div className="grid gap-4">
              <Controller
                name="fullName"
                control={control}
                rules={{ required: "Full name is required" }}
                render={({ field }) => (
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Enter your full name"
                      {...field}
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
                render={({ field }) => (
                  <div>
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />

              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender is required" }}
                render={({ field }) => (
                  <div>
                    <Label>Gender</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="email"
                control={control}
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" {...field} />
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="Enter your phone number" {...field} />
                    {errors.phone && (
                      <span className="text-sm text-red-500">{errors.phone.message}</span>
                    )}
                  </div>
                )}
              />

              <div>
                <Label htmlFor="profilePicture">Profile Picture</Label>
                <Input id="profilePicture" type="file" accept="image/*" />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Athletic Background</h2>
            <div className="grid gap-4">
              <Controller
                name="primarySport"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Primary Sport</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="cricket">Cricket</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="badminton">Badminton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="secondarySport"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Secondary Sport (Optional)</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select secondary sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="cricket">Cricket</SelectItem>
                        <SelectItem value="basketball">Basketball</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="badminton">Badminton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="currentLevel"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Current Level</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your level" />
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
                name="playingExperience"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Playing Experience (Years)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="Years of experience" 
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
                    <Label>Recent Achievements</Label>
                    <Textarea 
                      placeholder="List your recent achievements and awards"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </div>
                )}
              />

              <Controller
                name="currentClub"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Current Club/Academy</Label>
                    <Input 
                      placeholder="Enter your current club or academy name" 
                      {...field}
                    />
                  </div>
                )}
              />

              <Controller
                name="coachDetails"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Coach Details (Optional)</Label>
                    <Input 
                      placeholder="Coach name and contact information" 
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
            <h2 className="text-2xl font-bold">Physical Attributes</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label>Height (cm)</Label>
                      <Input 
                        type="number" 
                        placeholder="Height in centimeters" 
                        {...field}
                      />
                    </div>
                  )}
                />
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input 
                        type="number" 
                        placeholder="Weight in kilograms" 
                        {...field}
                      />
                    </div>
                  )}
                />
              </div>

              <Controller
                name="dominantSide"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Dominant Side</Label>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="left" id="left" />
                        <Label htmlFor="left">Left</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="right" id="right" />
                        <Label htmlFor="right">Right</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Both</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              />

              <Controller
                name="bloodGroup"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Blood Group</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a+">A+</SelectItem>
                        <SelectItem value="a-">A-</SelectItem>
                        <SelectItem value="b+">B+</SelectItem>
                        <SelectItem value="b-">B-</SelectItem>
                        <SelectItem value="o+">O+</SelectItem>
                        <SelectItem value="o-">O-</SelectItem>
                        <SelectItem value="ab+">AB+</SelectItem>
                        <SelectItem value="ab-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="fitnessLevel"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Fitness Level</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fitness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Medical & Health Details</h2>
            <div className="grid gap-4">
              <Controller
                name="existingInjuries"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="existing-injuries" 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="existing-injuries">Existing Injuries</Label>
                  </div>
                )}
              />

              <div>
                <Label>Medical Conditions</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Controller
                    name="medicalConditions.asthma"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="asthma" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="asthma">Asthma</Label>
                      </div>
                    )}
                  />
                  <Controller
                    name="medicalConditions.diabetes"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="diabetes" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="diabetes">Diabetes</Label>
                      </div>
                    )}
                  />
                  <Controller
                    name="medicalConditions.heartCondition"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="heart-condition" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="heart-condition">Heart Condition</Label>
                      </div>
                    )}
                  />
                  <Controller
                    name="medicalConditions.other"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="other" 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    )}
                  />
                </div>
              </div>

              <Controller
                name="previousSurgeries"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Previous Surgeries</Label>
                    <Textarea 
                      placeholder="List any previous surgeries (if any)" 
                      {...field}
                    />
                  </div>
                )}
              />

              <Controller
                name="allergies"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Allergies</Label>
                    <Input 
                      placeholder="List any allergies" 
                      {...field}
                    />
                  </div>
                )}
              />

              <div>
                <Label>Emergency Contact</Label>
                <div className="grid gap-2">
                  <Controller
                    name="emergencyContact.name"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        placeholder="Emergency contact name" 
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="emergencyContact.relationship"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        placeholder="Relationship" 
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="emergencyContact.phone"
                    control={control}
                    render={({ field }) => (
                      <Input 
                        placeholder="Phone number" 
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>

              <Controller
                name="dietaryPreferences"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Dietary Preferences</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Restrictions</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="gluten-free">Gluten Free</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <div>
                <Label>Fitness Certificate</Label>
                <Input type="file" accept=".pdf,.doc,.docx" />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Career & Goals</h2>
            <div className="grid gap-4">
              <Controller
                name="careerGoal"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Career Goal</Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Become Professional</SelectItem>
                        <SelectItem value="university">University Team</SelectItem>
                        <SelectItem value="scholarship">Sports Scholarship</SelectItem>
                        <SelectItem value="hobby">Hobby/Fitness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <div className="space-y-2">
                <Controller
                  name="lookingForCoach"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="looking-coach" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="looking-coach">Looking for a Coach</Label>
                    </div>
                  )}
                />

                <Controller
                  name="lookingForTeam"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="looking-team" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="looking-team">Looking for a Team</Label>
                    </div>
                  )}
                />

                <Controller
                  name="interestedInSponsorships"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sponsorship" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="sponsorship">Interested in Sponsorships</Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Social Media & Verification</h2>
            <div className="grid gap-4">
              <Controller
                name="instagram"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Instagram Handle</Label>
                    <Input placeholder="@username" {...field} />
                  </div>
                )}
              />

              <Controller
                name="twitter"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>Twitter/X Handle</Label>
                    <Input placeholder="@username" {...field} />
                  </div>
                )}
              />

              <Controller
                name="youtube"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>YouTube Channel</Label>
                    <Input placeholder="Channel URL" {...field} />
                  </div>
                )}
              />

              <Controller
                name="linkedin"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label>LinkedIn Profile</Label>
                    <Input placeholder="Profile URL" {...field} />
                  </div>
                )}
              />

              <div>
                <Label>ID Proof</Label>
                <Input type="file" accept=".pdf,.jpg,.png" />
              </div>

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
                render={({ field: { onChange, value } }) => (
                  <div>
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      placeholder="Enter your password"
                      value={value || ""}
                      onChange={onChange}
                    />
                    {errors.password && (
                      <span className="text-sm text-red-500">{errors.password.message}</span>
                    )}
                  </div>
                )}
              />

              <div className="space-y-2">
                <Controller
                  name="dataConsent"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="data-consent" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="data-consent">
                        I consent to sharing my data with coaches and teams
                      </Label>
                    </div>
                  )}
                />

                <Controller
                  name="termsAgreed"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="terms" 
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label htmlFor="terms">
                        I agree to the platform rules and terms of service
                      </Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Review Your Information</h2>
            <div className="grid gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                  <p><span className="font-medium">Gender:</span> {formData.gender}</p>
                  <p>
                    <span className="font-medium">Date of Birth:</span> 
                    {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "PPP") : "Not provided"}
                  </p>
                </div>
              </div>

              {/* Athletic Background */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Athletic Background</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Primary Sport:</span> {formData.primarySport}</p>
                  <p><span className="font-medium">Secondary Sport:</span> {formData.secondarySport || "Not provided"}</p>
                  <p><span className="font-medium">Current Level:</span> {formData.currentLevel}</p>
                  <p><span className="font-medium">Experience:</span> {formData.playingExperience} years</p>
                  <p><span className="font-medium">Current Club:</span> {formData.currentClub || "Not provided"}</p>
                  <p><span className="font-medium">Coach Details:</span> {formData.coachDetails || "Not provided"}</p>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Physical Attributes</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Height:</span> {formData.height} cm</p>
                  <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>
                  <p><span className="font-medium">Dominant Side:</span> {formData.dominantSide}</p>
                  <p><span className="font-medium">Blood Group:</span> {formData.bloodGroup || "Not provided"}</p>
                  <p><span className="font-medium">Fitness Level:</span> {formData.fitnessLevel || "Not provided"}</p>
                </div>
              </div>

              {/* Medical & Health */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Medical & Health</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Existing Injuries:</span> {formData.existingInjuries ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Medical Conditions:</span></p>
                  <ul className="list-disc list-inside pl-4">
                    {formData.medicalConditions?.asthma && <li>Asthma</li>}
                    {formData.medicalConditions?.diabetes && <li>Diabetes</li>}
                    {formData.medicalConditions?.heartCondition && <li>Heart Condition</li>}
                    {formData.medicalConditions?.other && <li>Other</li>}
                  </ul>
                  <p><span className="font-medium">Allergies:</span> {formData.allergies || "None"}</p>
                  <p><span className="font-medium">Dietary Preferences:</span> {formData.dietaryPreferences || "Not specified"}</p>
                </div>
              </div>

              {/* Career Goals */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Career Goals</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Career Goal:</span> {formData.careerGoal}</p>
                  <p><span className="font-medium">Looking for Coach:</span> {formData.lookingForCoach ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Looking for Team:</span> {formData.lookingForTeam ? "Yes" : "No"}</p>
                  <p><span className="font-medium">Interested in Sponsorships:</span> {formData.interestedInSponsorships ? "Yes" : "No"}</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Social Media</h3>
                <div className="grid gap-2 text-sm">
                  <p><span className="font-medium">Instagram:</span> {formData.instagram || "Not provided"}</p>
                  <p><span className="font-medium">Twitter:</span> {formData.twitter || "Not provided"}</p>
                  <p><span className="font-medium">YouTube:</span> {formData.youtube || "Not provided"}</p>
                  <p><span className="font-medium">LinkedIn:</span> {formData.linkedin || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">Athlete Registration</h1>
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
            onClick={handlePreviousStep}
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

export default PlayerSignup; 