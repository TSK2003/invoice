import React from 'react';
import { CompanyForm } from '../../components/builder/CompanyForm';
import { useCompany } from '../../app/providers/CompanyProvider';

export const CompanyPage: React.FC = () => {
  const { company, updateCompany } = useCompany();

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <CompanyForm
        company={company}
        onChangeCompany={updateCompany}
        onSaveProfile={async () => {
          await updateCompany(company);
        }}
      />
    </div>
  );
};
