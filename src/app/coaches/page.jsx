"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { 
  Search, Trophy, Medal, Star,
  MapPin, Clock, CheckCircle,
  GraduationCap, Briefcase, Users
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../utils/firebase";
import { toast } from "sonner";

const DEFAULT_PROFILE_IMAGE = "https://api.dicebear.com/7.x/initials/svg";

const CoachesPage = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    sport: "",
    experience: "",
  });

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const coachesRef = collection(db, "coaches");
      const querySnapshot = await getDocs(coachesRef);
      
      const coachesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("Coach document:", doc.id, data); // Debug log
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log("All fetched coaches:", coachesData);
      setCoaches(coachesData);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      toast.error("Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  const filteredCoaches = coaches.filter(coach => {
    const searchMatch = coach.fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
                       coach.primarySport.toLowerCase().includes(filters.search.toLowerCase());
    const sportMatch = !filters.sport || coach.primarySport === filters.sport;
    const experienceMatch = !filters.experience || coach.yearsExperience === filters.experience;
    
    return searchMatch && sportMatch && experienceMatch;
  });

  const renderCoachCard = (coach) => (
    <Card 
      key={coach.id}
      className="group relative bg-white overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Top Banner */}
      <div className="absolute inset-x-0 h-24 bg-gradient-to-r from-primary/10 to-purple-500/10" />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={coach.profilePicture || `${DEFAULT_PROFILE_IMAGE}?seed=${encodeURIComponent(coach.fullName)}`}
              alt={coach.fullName}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              onError={(e) => {
                e.target.src = `${DEFAULT_PROFILE_IMAGE}?seed=${encodeURIComponent(coach.fullName)}`;
              }}
            />
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {coach.fullName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10">
                  {coach.primarySport}
                </Badge>
                {coach.status === "approved" && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-primary" />
              <span>{coach.coachingLevel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>{coach.yearsExperience}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{coach.nationality}</span>
            </div>
            {coach.availability && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {Object.entries(coach.availability)
                    .filter(([_, value]) => value)
                    .map(([type]) => type)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        {(coach.certifications || coach.coachingPhilosophy) && (
          <div className="mb-4 space-y-3">
            {coach.certifications && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Certifications</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {coach.certifications}
                </p>
              </div>
            )}
            {coach.coachingPhilosophy && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Philosophy</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {coach.coachingPhilosophy}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
          onClick={() => {
            const encodedEmail = encodeURIComponent(coach.email);
            window.location.href = `/profile/coach/${encodedEmail}`;
          }}
        >
          View Profile
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
            Find Your Perfect Coach
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with experienced coaches who can help you reach your athletic potential
          </p>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto mb-12">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Search coaches..." 
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <Select
                value={filters.sport}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sport: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Coaches Grid */}
        {loading ? (
          <div className="text-center py-12">Loading coaches...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCoaches.map(renderCoachCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachesPage;
