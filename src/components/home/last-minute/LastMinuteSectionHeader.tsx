import React from 'react';

const LastMinuteSectionHeader: React.FC = () => {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance">
        Viaggi Last Minute
      </h2>
      <p className="mx-auto max-w-3xl text-xl text-foreground">
        Ultime disponibilità su viaggi fotografici in partenza a breve
      </p>
    </div>
  );
};

export default LastMinuteSectionHeader;
