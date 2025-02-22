"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Instagram, Twitter, Youtube, Linkedin, Edit,
  Medal, Activity, Calendar, MapPin, Phone,
  AlertCircle, Heart, Trophy, Dumbbell,
  Scale, Ruler, CircleUser, Mail, Target,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Send,
  UserCheck,
  Building,
  Brain, Utensils, TrendingUp, ListTodo
} from "lucide-react";
import { doc, setDoc, collection, addDoc, serverTimestamp, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { toast } from "sonner";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

const PlayerDashboard = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coachDetails, setCoachDetails] = useState({});
  //  console.log( "coachDetails"+coachDetails)

  useEffect(() => {
    try {
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        console.log("userData"+ JSON.stringify(userData))
        setPlayerData(userData);
      } else {
        toast.error("User data not found");
        // Optionally redirect to login
        // router.push('/login');
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCoachDetails = async () => {
      // console.log("playerData"+playerData)
      if (!playerData?.marketplaceRequests) return;
      console.log("playerData?.marketplaceRequests"+playerData?.marketplaceRequests)
      try {
        const details = {};
        for (const request of playerData.marketplaceRequests) {
          console.log("request"+request)
          const coachRef = doc(db, "coaches", request.coachId);
          const coachSnap = await getDoc(coachRef);
          if (coachSnap.exists()) {
          // console.log("coachSnap.data()"+coachSnap.data())
            details[request.coachId] = coachSnap.data();
          }
        }
        setCoachDetails(details);
      } catch (error) {
        console.error("Error fetching coach details:", error);
      }
    };

    fetchCoachDetails();
  }, [playerData?.marketplaceRequests]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>;
  }

  if (!playerData) {
    return <div className="min-h-screen flex items-center justify-center">
      No user data found
    </div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Function to handle marketplace request
  const handleMarketplaceRequest = async () => {
    try {
      setIsSubmitting(true);
      
      const requestData = {
        playerId: playerData.email,
        playerName: playerData.fullName,
        primarySport: playerData.primarySport,
        experience: playerData.playingExperience,
        currentLevel: playerData.currentLevel,
        achievements: playerData.achievements?.split(',') || [],
        lookingForCoach: playerData.lookingForCoach,
        lookingForTeam: playerData.lookingForTeam,
        location: playerData.address,
        email: playerData.email,
        height: playerData.height,
        weight: playerData.weight,
        dominantSide: playerData.dominantSide,
        currentClub: playerData.currentClub,
        status: "pending",
        createdAt: serverTimestamp(),
        marketplaceRequests: [],
        isVerified: false
      };

      // Create the marketplace_requests collection and add document
      const marketplaceRef = collection(db, "marketplace_requests");
      
      // Use addDoc instead of setDoc to let Firestore generate a unique ID
      await addDoc(marketplaceRef, requestData);

      toast.success("Marketplace request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectRequest = async (request) => {
    try {
      // Update the request status
      const playerRef = doc(db, "players", playerData.email);
      
      await updateDoc(playerRef, {
        marketplaceRequests: playerData.marketplaceRequests.map(req => 
          req.coachId === request.coachId 
            ? { ...req, status: 'accepted' }
            : req
        )
      });

      toast.success("Connection request accepted!");
      
      // Update local state
      setPlayerData(prev => ({
        ...prev,
        marketplaceRequests: prev.marketplaceRequests.map(req => 
          req.coachId === request.coachId 
            ? { ...req, status: 'accepted' }
            : req
        )
      }));
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast.error("Failed to accept connection");
    }
  };

  const AIInsights = ({ playerData }) => {
    const [insights, setInsights] = useState({
      trainingPlan: null,
      dietPlan: null,
      growthPath: null,
      loading: true,
      error: null
    });

    useEffect(() => {
      generateInsights();
    }, [playerData]);

    const generateInsights = async () => {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Structure the player data for the prompt
        const playerContext = `
          Player Profile:
          - Name: ${playerData.fullName}
          - Sport: ${playerData.primarySport}
          - Level: ${playerData.currentLevel}
          - Experience: ${playerData.playingExperience} years
          - Physical: Height ${playerData.height}cm, Weight ${playerData.weight}kg
          - Goals: ${playerData.careerGoal}
          - Current Fitness: ${playerData.fitnessLevel}
        `;

        // Generate Training Plan
        const trainingPrompt = `
          As a professional sports coach, create a structured 4-week training plan for this player:
          ${playerContext}
          Format the response as JSON with:
          {
            "weeklyPlans": [
              {
                "week": 1,
                "focus": "",
                "sessions": [
                  { "day": "Monday", "activity": "", "duration": "", "intensity": "" }
                ]
              }
            ],
            "keyMetrics": ["metric1", "metric2"],
            "expectedOutcomes": ["outcome1", "outcome2"]
          }
        `;
        console.log("Training prompt:", trainingPrompt);

        // const trainingResponse = await model.generateContent(trainingPrompt);
        // console.log("Training response:", trainingResponse);
        // const trainingPlan = JSON.parse(trainingResponse.response.text());
        // console.log("Training plan:", trainingPlan);

        // Generate Diet Plan
        // const dietPrompt = `
        //   As a sports nutritionist, create a personalized diet plan for this athlete:
        //   ${playerContext}
        //   Format as JSON with:
        //   {
        //     "dailyMeals": [
        //       {
        //         "meal": "Breakfast",
        //         "suggestions": [],
        //         "nutrients": { "protein": "", "carbs": "", "fats": "" }
        //       }
        //     ],
        //     "hydration": "",
        //     "supplements": []
        //   }
        // `;

        // const dietResponse = await model.generateContent(dietPrompt);
        // const dietPlan = JSON.parse(dietResponse.response.text());

        // // Generate Growth Path
        // const growthPrompt = `
        //   Create a career progression roadmap for this athlete:
        //   ${playerContext}
        //   Format as JSON with:
        //   {
        //     "milestones": [
        //       {
        //         "level": "",
        //         "timeframe": "",
        //         "objectives": [],
        //         "skillsToMaster": []
        //       }
        //     ],
        //     "opportunities": [],
        //     "recommendations": []
        //   }
        // `;

        // const growthResponse = await model.generateContent(growthPrompt);
        // const growthPath = JSON.parse(growthResponse.response.text());

        setInsights({
          trainingPlan,
          dietPlan,
          growthPath,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error("Error generating insights:", error);
        setInsights(prev => ({ ...prev, loading: false, error: error.message }));
      }
    };

    if (insights.loading) {
      return <div className="flex items-center justify-center p-8">Loading AI insights...</div>;
    }

    if (insights.error) {
      return <div className="text-red-500 p-4">Error loading insights: {insights.error}</div>;
    }

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="training" className="w-full">
            <TabsList className="grid grid-cols-3 gap-4 mb-8">
              <TabsTrigger value="training" className="flex items-center gap-2">
                <ListTodo className="w-4 h-4" />
                Training Plan
              </TabsTrigger>
              <TabsTrigger value="diet" className="flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Diet Plan
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Growth Path
              </TabsTrigger>
            </TabsList>

            <TabsContent value="training" className="space-y-6">
              {/* Training Plan Content */}
              <div className="space-y-6">
                {insights.trainingPlan.weeklyPlans.map((week, index) => (
                  <div key={index} className="space-y-4">
                    <h4 className="font-medium">Week {week.week}: {week.focus}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {week.sessions.map((session, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="font-medium text-primary">{session.day}</div>
                          <div className="text-sm text-gray-600">{session.activity}</div>
                          <div className="text-sm text-gray-500">
                            {session.duration} • {session.intensity}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diet" className="space-y-6">
              {/* Diet Plan Content */}
              <div className="grid gap-6">
                {insights.dietPlan.dailyMeals.map((meal, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium text-primary">{meal.meal}</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {meal.suggestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(meal.nutrients).map(([nutrient, value]) => (
                        <div key={nutrient} className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 capitalize">{nutrient}</div>
                          <div className="font-medium">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="growth" className="space-y-6">
              {/* Growth Path Content */}
              <div className="space-y-8">
                {insights.growthPath.milestones.map((milestone, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-primary/20">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary"></div>
                    <h4 className="font-medium text-primary mb-2">
                      {milestone.level} • {milestone.timeframe}
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium">Objectives:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {milestone.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Skills to Master:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {milestone.skillsToMaster.map((skill, idx) => (
                            <li key={idx}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          {/* Profile Card */}
          <Card className="p-6 lg:col-span-1 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-primary/10">
                  <AvatarImage src={playerData.profilePicture} />
                  <AvatarFallback className="bg-primary/5">
                    <CircleUser className="w-16 h-16 text-primary/40" />
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-2 right-0 px-3" variant={playerData.status === 'active' ? 'default' : 'secondary'}>
                  {playerData.status === 'active' ? '✓ Active' : '⌛ Pending'}
                </Badge>
              </div>
              
              <h2 className="text-2xl font-bold mt-4 mb-1">{playerData.fullName}</h2>
              <p className="text-muted-foreground mb-3 text-sm">
                {playerData.primarySport} Player • {playerData.currentLevel}
              </p>
              
              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="bg-primary/5">
                  {playerData.fitnessLevel}
                </Badge>
                <Badge variant="outline" className="bg-primary/5">
                  {`${playerData.playingExperience}Y Exp`}
                </Badge>
              </div>

              <div className="w-full space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <div className="flex gap-2 justify-center mt-4">
                  <Button size="icon" variant="outline">
                    <Instagram className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <Card className="p-6 lg:col-span-3 bg-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Player Overview</h3>
              <Badge variant="outline" className="px-4">
                ID: #AP2024
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{playerData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{playerData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{formatDate(playerData.dateOfBirth)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Club</p>
                    <p className="font-medium">{playerData.currentClub}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Scale className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Physical Stats</p>
                    <p className="font-medium">{playerData.height}cm • {playerData.weight}kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                  <Heart className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Blood Group</p>
                    <p className="font-medium">{playerData.bloodGroup}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{playerData.address}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Medical & Career Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-xl font-semibold">Medical History</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h4 className="font-medium mb-3">Medical Conditions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-lg ${playerData.medicalConditions.heartCondition ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    <p className="text-sm font-medium">Heart Condition</p>
                    <p className="text-lg">{playerData.medicalConditions.heartCondition ? 'Yes' : 'No'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${playerData.existingInjuries ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    <p className="text-sm font-medium">Existing Injuries</p>
                    <p className="text-lg">{playerData.existingInjuries ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Career Goals</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Career Objective</p>
                <p className="text-lg font-medium">{playerData.careerGoal}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${playerData.lookingForCoach ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  <Dumbbell className="w-5 h-5 mb-2" />
                  <p className="font-medium">Looking for Coach</p>
                  <p className="text-2xl font-semibold mt-1">{playerData.lookingForCoach ? "Yes" : "No"}</p>
                </div>
                <div className={`p-4 rounded-lg ${playerData.lookingForTeam ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  <Activity className="w-5 h-5 mb-2" />
                  <p className="font-medium">Looking for Team</p>
                  <p className="text-2xl font-semibold mt-1">{playerData.lookingForTeam ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Marketplace Section */}
        <div className="mt-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="w-6 h-6 text-primary" />
              <h3 className="text-xl font-semibold">Marketplace</h3>
            </div>

            {playerData.status !== "active" ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-medium">Profile Not Verified</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get verified to connect with coaches and organizations in your area.
                    Submit a request to join the marketplace.
                  </p>
                  <Button 
                    onClick={handleMarketplaceRequest}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Marketplace Request
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-600 font-medium">Your profile is verified</p>
                </div>

                {playerData.marketplaceRequests?.length > 0 ? (
                  <div className="grid gap-4">
                    {playerData.marketplaceRequests.map((request, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 bg-primary/5 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={coachDetails[request.coachId]?.profilePicture} 
                              alt={request.coachName}
                            />
                            <AvatarFallback>
                              {request.coachName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{request.coachName}</p>
                              {coachDetails[request.coachId]?.isVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <UserCheck className="w-4 h-4" />
                              <span>{coachDetails[request.coachId]?.primarySport} Coach</span>
                              <span>•</span>
                              <span>{new Date(request.date).toLocaleDateString()}</span>
                            </div>
                            {request.status === 'pending' && (
                              <Badge variant="outline" className="mt-2">
                                Pending
                              </Badge>
                            )}
                            {request.status === 'accepted' && (
                              <Badge variant="success" className="mt-2">
                                Connected
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const encodedEmail = encodeURIComponent(request.coachId);
                              window.location.href = `/profile/coach/${encodedEmail}`;
                            }}
                          >
                            View Profile
                          </Button>
                          {request.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleConnectRequest(request)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <XCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No connection requests yet</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* AI Insights Section */}
        {/* <AIInsights playerData={playerData} /> */}
      </div>
    </div>
  );
};

export default PlayerDashboard;