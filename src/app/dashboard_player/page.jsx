"use client";

import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Edit,
  Medal,
  Activity,
  User,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  Heart
} from "lucide-react";

const PlayerDashboard = () => {
  // This would come from your database/context in real app
  const playerData = {
    fullName: "John Doe",
    profilePicture: "/default-avatar.png",
    primarySport: "Football",
    currentLevel: "Professional",
    achievements: ["State Champion 2023", "MVP 2022"],
    fitnessLevel: 85,
    enduranceScore: 78,
    careerStats: {
      tournaments: 15,
      wins: 8
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Hero Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={playerData.profilePicture} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold mb-2">{playerData.fullName}</h2>
            <p className="text-muted-foreground mb-2">
              {playerData.primarySport} • {playerData.currentLevel}
            </p>
            <div className="flex gap-2 mb-4">
              {playerData.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary">
                  <Medal className="w-3 h-3 mr-1" />
                  {achievement}
                </Badge>
              ))}
            </div>
            <Button className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Performance Highlights */}
        <Card className="p-6 md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Performance Highlights</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Fitness Level</span>
                <span>{playerData.fitnessLevel}%</span>
              </div>
              <Progress value={playerData.fitnessLevel} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Endurance Score</span>
                <span>{playerData.enduranceScore}%</span>
              </div>
              <Progress value={playerData.enduranceScore} className="h-2" />
            </div>
            <div>
              <h4 className="font-medium mb-2">Career Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{playerData.careerStats.tournaments}</div>
                  <div className="text-sm text-muted-foreground">Tournaments</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold">{playerData.careerStats.wins}</div>
                  <div className="text-sm text-muted-foreground">Wins</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Athletic & Physical Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Athletic Background</h3>
          <div className="space-y-4">
            {/* Add athletic background details */}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Physical Attributes</h3>
          <div className="space-y-4">
            {/* Add physical attributes */}
          </div>
        </Card>
      </div>

      {/* Medical & Career Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Medical History</h3>
          <div className="space-y-4">
            {/* Add medical history */}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Career Goals</h3>
          <div className="space-y-4">
            {/* Add career goals */}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlayerDashboard;
