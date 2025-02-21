import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function VerificationCredentials() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div>
        <Label htmlFor="governmentId">Government ID Proof</Label>
        <Input
          id="governmentId"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          {...register("governmentId")} />
      </div>
      <div>
        <Label htmlFor="coachingCertification">Coaching Certification</Label>
        <Input
          id="coachingCertification"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          {...register("coachingCertification")} />
      </div>
      <div>
        <Label htmlFor="linkedinProfile">LinkedIn Profile / Portfolio Link</Label>
        <Input
          id="linkedinProfile"
          {...register("linkedinProfile")}
          placeholder="https://www.linkedin.com/in/yourprofile" />
      </div>
    </div>)
  );
}

