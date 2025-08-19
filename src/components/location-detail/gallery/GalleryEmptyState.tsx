
import React from 'react';
import { Eye } from 'lucide-react';

const GalleryEmptyState: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center border border-gray-200">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
        <Eye className="w-8 h-8 text-gray-400" />
      </div>
      <h1 className="text-lg font-semibold text-gray-600 mb-2">Nessuna foto disponibile</h1>
      <p className="text-gray-500">Le foto di questa location verranno aggiunte presto</p>
    </div>
  );
};

export default GalleryEmptyState;
