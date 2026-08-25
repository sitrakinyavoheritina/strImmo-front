import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="space-y-2 p-4 text-center">
      <div className="w-12 h-12 bg-blue-50 text-brand-primary rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
        {icon}
      </div>
      <h3 className="font-semibold text-content-main">{title}</h3>
      <p className="text-xs text-content-muted leading-relaxed">{description}</p>
    </div>
  );
};