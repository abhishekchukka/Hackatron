import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"

export function ContactInformation() {
  const { register } = useFormContext()

  return (
    (<div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com" />
      </div>
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <PhoneInput
          country={"us"}
          inputProps={{
            name: "phone",
            required: true,
            autoFocus: true,
          }} />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} placeholder="Enter your address" />
      </div>
    </div>)
  );
}

