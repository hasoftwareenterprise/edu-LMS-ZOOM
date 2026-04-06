import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 40, className = "" }) => {
  const getInitials = (n: string) => {
    return n.split(' ').map(i => i[0]).slice(0, 2).join('').toUpperCase() || 'U';
  };

  return (
    <div 
      className={`rounded-xl bg-primary/15 text-primary font-black flex items-center justify-center shrink-0 uppercase tracking-tighter ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
};

export default InitialsAvatar;
