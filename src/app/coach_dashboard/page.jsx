"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Medal, Activity, Calendar, MapPin, Phone,
  AlertCircle, Trophy, Dumbbell, Mail, Target,
  CheckCircle, XCircle, UserCheck, Building,
  Users, Clock, Briefcase, GraduationCap,
  Award, Star
} from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { toast } from "sonner";

const CoachDashboard = () => {
  const [coachData, setCoachData] = useState(null);
  const [marketplaceRequests, setMarketplaceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Get coach data from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setCoachData(userData);
        fetchMarketplaceRequests(userData.email);
      } else {
        toast.error("User data not found");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMarketplaceRequests = async (coachEmail) => {
    try {
      const requestsRef = collection(db, "marketplace_requests");
      const requestsQuery = query(requestsRef, where("lookingForCoach", "==", true));
      const querySnapshot = await getDocs(requestsQuery);
      
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMarketplaceRequests(requests);
    } catch (error) {
      console.error("Error fetching marketplace requests:", error);
      toast.error("Failed to fetch marketplace requests");
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      // Update player's verification status
      const playerRef = doc(db, "players", request.playerId);
      await updateDoc(playerRef, {
        isVerified: true,
        verifiedBy: coachData.email,
        verificationDate: new Date().toISOString()
      });

      // Delete the marketplace request
      const requestRef = doc(db, "marketplace_requests", request.id);
      await deleteDoc(requestRef);

      // Update local state to remove the request
      setMarketplaceRequests(prev => 
        prev.filter(req => req.id !== request.id)
      );

      toast.success(`Accepted ${request.playerName}'s request`);
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Failed to accept request");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>;
  }

  if (!coachData) {
    return <div className="min-h-screen flex items-center justify-center">
      No user data found
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <Card className="overflow-hidden border-none shadow-sm">
          <div className="relative">
            {/* Background Banner */}
            <div className="absolute inset-0 h-32 bg-gradient-to-r from-primary/10 to-primary/5" />
            
            <div className="relative px-8 pt-20 pb-8">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={coachData.profilePicture || ""} />
                  <AvatarFallback className="text-2xl">{coachData.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold">{coachData.fullName}</h1>
                    <Badge variant="secondary" className="font-normal">
                      {coachData.status === 'pending' ? 'Pending Approval' : 'Verified Coach'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{coachData.primarySport} Coach</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="bg-white">
                      {coachData.coachingLevel}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {coachData.yearsExperience} Years Experience
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      {coachData.nationality}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" className="ml-auto mt-4 md:mt-0">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <Card className="border-none shadow-sm">
            <div className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{coachData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{coachData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{coachData.nationality}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Coaching Details */}
          <Card className="border-none shadow-sm">
            <div className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Coaching Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span>Level: {coachData.coachingLevel}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>Experience: {coachData.yearsExperience}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>Certifications: {coachData.certifications || "Not specified"}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Availability */}
          <Card className="border-none shadow-sm">
            <div className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Availability</h3>
              <div className="space-y-4">
                {coachData.availability?.partTime && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Part Time</span>
                  </div>
                )}
                {coachData.availability?.fullTime && (
                  <div className="flex items-center gap-3 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span>Full Time</span>
                  </div>
                )}
                {coachData.availability?.flexible && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Flexible Hours</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Marketplace Requests */}
        <Card className="border-none shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-medium">Player Requests</h2>
              </div>
              <Badge variant="secondary">{marketplaceRequests.length} Pending</Badge>
            </div>

            {marketplaceRequests.length > 0 ? (
              <div className="grid gap-4">
                {marketplaceRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{request.playerName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.playerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {request.primarySport}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {request.currentLevel} • {request.experience} years
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {request.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          toast.info("View profile functionality coming soon");
                        }}
                      >
                        View Profile
                      </Button>
                      <Button 
                        size="sm"
                        variant="default"
                        onClick={() => handleAcceptRequest(request)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-muted-foreground">No player requests yet</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoachDashboard;