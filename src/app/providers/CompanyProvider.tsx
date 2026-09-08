import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CompanyProfile } from '../../types/company';
import { DocumentTemplateConfig } from '../../types/template';
import { DEFAULT_COMPANY_PROFILE } from '../../constants/defaultCompany';
import { AESCION_PROFESSIONAL_TEMPLATE } from '../../constants/initialTemplates';
import { 
  fetchCompanyProfile, 
  saveCompanyProfileToFirestore, 
  fetchTemplateConfig, 
  saveTemplateConfigToFirestore 
} from '../../services/firebase/firestore';

interface CompanyContextType {
  company: CompanyProfile;
  template: DocumentTemplateConfig;
  loading: boolean;
  updateCompany: (profile: CompanyProfile) => Promise<void>;
  updateTemplate: (tpl: DocumentTemplateConfig) => Promise<void>;
  refresh: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [template, setTemplate] = useState<DocumentTemplateConfig>(AESCION_PROFESSIONAL_TEMPLATE);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedCompany, fetchedTemplate] = await Promise.all([
        fetchCompanyProfile(),
        fetchTemplateConfig(),
      ]);
      setCompany(fetchedCompany);
      setTemplate(fetchedTemplate);
    } catch (err) {
      console.error('Failed to load company profile or template:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateCompany = async (profile: CompanyProfile) => {
    await saveCompanyProfileToFirestore(profile);
    setCompany(profile);
  };

  const updateTemplate = async (tpl: DocumentTemplateConfig) => {
    await saveTemplateConfigToFirestore(tpl);
    setTemplate(tpl);
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        template,
        loading,
        updateCompany,
        updateTemplate,
        refresh: loadData,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export function useCompany(): CompanyContextType {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
