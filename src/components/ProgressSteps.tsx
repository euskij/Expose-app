interface ProgressStepProps {
  steps: string[];
  currentStep: number;
}

export function ProgressSteps({ steps, currentStep }: ProgressStepProps) {
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div key={index} className={`progress-step ${index <= currentStep ? 'active' : ''}`}>
          <div className="step-circle">{index + 1}</div>
          <div className="step-label">{step}</div>
        </div>
      ))}
    </div>
  );
}