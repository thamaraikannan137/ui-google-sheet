import { Button, MuiCard } from '../components/common';

export const HomePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to Your App</h1>
      
      <MuiCard>
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-600 mb-4">
          This is a well-structured React boilerplate with TypeScript, Tailwind CSS, and best practices built-in.
        </p>
        <Button onClick={() => console.log('Clicked!')}>
          Get Started
        </Button>
      </MuiCard>
    </div>
  );
};

