import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const ageGroups = ["Kids", "Teens", "Adults", "Pros"]
const availabilityOptions = ["Part-time", "Full-time", "Flexible"]

export function AdditionalInformation() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div>
        <Label htmlFor="coachingPhilosophy">Coaching Philosophy</Label>
        <Textarea
          id="coachingPhilosophy"
          {...register("coachingPhilosophy")}
          placeholder="Briefly describe your coaching philosophy"
          maxLength={200} />
      </div>
      <div>
        <Label>Preferred Age Group to Coach</Label>
        <div className="grid grid-cols-2 gap-2">
          {ageGroups.map((group) => (
            <div key={group} className="flex items-center space-x-2">
              <Checkbox id={group} {...register("preferredAgeGroups")} value={group} />
              <Label htmlFor={group}>{group}</Label>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label>Availability</Label>
        <div className="grid grid-cols-2 gap-2">
          {availabilityOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox id={option} {...register("availability")} value={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>)
  );
}

