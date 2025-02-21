"use client";

import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, Filter, Search } from "lucide-react";

const ATHLETES = [
  {
    id: 1,
    name: "Marcus Rashford",
    image: "https://resources.premierleague.com/premierleague/photos/players/250x250/p176297.png",
    sport: "Football",
    position: "Forward",
    level: "Pro",
    verified: true,
    stats: {
      height: "5'11\"",
      weight: "154 lbs",
      speed: "4.3s",
      jump: "38\""
    }
  },
  {
    id: 2,
    name: "Virat Kohli",
    image: "https://www.cricbuzz.com/a/img/v1/152x152/i1/c170661/virat-kohli.jpg",
    sport: "Cricket",
    position: "Batsman",
    level: "Pro",
    verified: true,
    stats: {
      height: "5'9\"",
      weight: "152 lbs",
      speed: "4.5s",
      jump: "32\""
    }
  },
  {
    id: 3,
    name: "PV Sindhu",
    image: "https://img.olympicchannel.com/images/image/private/t_1-1_300/f_auto/primary/wfrhxc0cas5d4uit6rwy",
    sport: "Badminton",
    position: "Singles",
    level: "Pro",
    verified: true,
    stats: {
      height: "5'10\"",
      weight: "143 lbs",
      speed: "4.2s",
      jump: "36\""
    }
  },
  {
    id: 4,
    name: "Erling Haaland",
    image: "https://resources.premierleague.com/premierleague/photos/players/250x250/p223094.png",
    sport: "Football",
    position: "Striker",
    level: "Pro",
    verified: true,
    stats: {
      height: "6'4\"",
      weight: "194 lbs",
      speed: "4.4s",
      jump: "39\""
    }
  }
];

const MarketplacePage = () => {
  const [filters, setFilters] = useState({
    location: "",
    sport: "",
    experience: "",
    verified: false,
    sprintSpeed: [0],
    jumpHeight: [0],
  });

  return (
    <div className="container mx-auto px-24 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Discover & Recruit Top Athletes</h1>
        <p className="text-lg text-gray-600 mb-8">
          Browse verified players based on their skills, achievements, and potential
        </p>
        
        {/* Search and Filter Bar */}
        <div className="flex gap-4 max-w-3xl mx-auto">
          <div className="flex-1 flex gap-2">
            <Input placeholder="Search athletes..." className="flex-1" />
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Athletes</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <Input placeholder="Location" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch id="verified" />
                  <Label htmlFor="verified">Verified Athletes Only</Label>
                </div>
                <div className="space-y-2">
                  <Label>Sprint Speed (seconds)</Label>
                  <Slider
                    defaultValue={[0]}
                    max={15}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Athletes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {ATHLETES.map((athlete) => (
          <div key={athlete.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={athlete.image}
                alt={athlete.name}
                className="w-full h-48 object-cover"
              />
              {athlete.verified && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" /> Verified
                </Badge>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{athlete.name}</h3>
                  <p className="text-gray-600">{athlete.sport} • {athlete.position}</p>
                </div>
                <Badge variant="secondary">{athlete.level}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>Height: {athlete.stats.height}</div>
                <div>Weight: {athlete.stats.weight}</div>
                <div>Speed: {athlete.stats.speed}</div>
                <div>Jump: {athlete.stats.jump}</div>
              </div>
              <Button className="w-full">View Profile</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplacePage;