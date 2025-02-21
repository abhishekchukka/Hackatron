import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function AuthenticationAgreement() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="termsAgreement" {...register("termsAgreement")} />
        <Label htmlFor="termsAgreement">I agree to the Terms & Conditions</Label>
      </div>
    </div>)
  );
}

