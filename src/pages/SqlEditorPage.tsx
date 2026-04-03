import React from 'react';
import SqlEditor from '@/components/database/SqlEditor';

const SqlEditorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SqlEditor />
    </div>
  );
};

export default SqlEditorPage;
