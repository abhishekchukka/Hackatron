import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const sports = ["Cricket", "Football", "Tennis", "Basketball", "Swimming", "Athletics"]
const experienceLevels = ["0-2 years", "3-5 years", "6-10 years", "10+ years"]
const coachingLevels = ["Beginner", "Intermediate", "Advanced", "Professional"]

export function ProfessionalDetails() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div>
        <Label htmlFor="primarySport">Primary Sport</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select your primary sport" />
          </SelectTrigger>
          <SelectContent>
            {sports.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="experience">Years of Coaching Experience</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select your experience" />
          </SelectTrigger>
          <SelectContent>
            {experienceLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="coachingLevel">Coaching Level</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select your coaching level" />
          </SelectTrigger>
          <SelectContent>
            {coachingLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="certifications">Certifications & Licenses</Label>
        <Input id="certifications" type="file" multiple {...register("certifications")} />
      </div>
      <div>
        <Label htmlFor="affiliation">Current Coaching Affiliation</Label>
        <Input
          id="affiliation"
          {...register("affiliation")}
          placeholder="Enter your current affiliation" />
      </div>
      <div>
        <Label htmlFor="achievements">Achievements</Label>
        <Textarea
          id="achievements"
          {...register("achievements")}
          placeholder="List your major achievements"
          maxLength={500} />
      </div>
    </div>)
  );
}

