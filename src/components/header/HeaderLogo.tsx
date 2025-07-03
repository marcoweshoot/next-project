
import Link from "next/link";
import React from 'react';

interface HeaderLogoProps {
  isScrolled: boolean;
}

const HeaderLogo: React.FC<{
  children?: React.ReactNode;
}> = ({
  isScrolled,
  children
}) => {
  return (
    <div className="flex-shrink-0">
      <Link href="/" className="flex items-center" title="WeShoot | Viaggi Fotografici">
        <img 
          src={isScrolled 
            ? "/lovable-uploads/64763a8e-c4be-4770-b713-082d8d5b4f9e.png"
            : "/lovable-uploads/11f40570-4fe1-4259-a79d-7c9d26dc7505.png"
          } 
          alt="WeShoot" 
          className="h-10 w-auto"
        />
      </Link>
    </div>
  );
};

export default HeaderLogo;
