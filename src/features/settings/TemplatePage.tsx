import React from 'react';
import { TemplateSettingsEditor } from '../../components/builder/TemplateSettingsEditor';
import { useCompany } from '../../app/providers/CompanyProvider';

export const TemplatePage: React.FC = () => {
  const { template, updateTemplate } = useCompany();

  return (
    <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <TemplateSettingsEditor
        template={template}
        onChangeTemplate={updateTemplate}
        onSaveTemplate={async () => {
          await updateTemplate(template);
        }}
      />
    </div>
  );
};
