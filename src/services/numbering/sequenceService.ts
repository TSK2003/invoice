import { DocumentType } from '../../types/document';
import { getNextDocumentNumber, fetchDocuments } from '../firebase/firestore';

export async function generateDocumentSequence(type: DocumentType, companyId = 'default'): Promise<string> {
  return getNextDocumentNumber(type, companyId);
}

export async function isDocumentNumberUnique(docNumber: string, excludeDocId?: string): Promise<boolean> {
  const docs = await fetchDocuments();
  const collision = docs.find((d) => d.documentNumber.toLowerCase() === docNumber.trim().toLowerCase() && d.id !== excludeDocId);
  return !collision;
}
