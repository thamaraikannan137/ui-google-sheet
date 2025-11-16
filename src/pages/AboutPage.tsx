import { MuiCard } from '../components/common';

export const AboutPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">About</h1>
      
      <MuiCard>
        <h2 className="text-2xl font-semibold mb-4">About This App</h2>
        <p className="text-gray-600">
          This is an example about page. Replace this content with your own information.
        </p>
      </MuiCard>
    </div>
  );
};

