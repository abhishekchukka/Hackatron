import { Check } from "lucide-react"

export function Stepper({
  steps,
  currentStep
}) {
  return (
    (<div className="flex justify-between">
      {steps.map((step, index) => (
        <div key={step} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
            {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
          </div>
          <span className="text-xs mt-1">{step}</span>
        </div>
      ))}
    </div>)
  );
}

