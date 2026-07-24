// File: services/mockData.ts
import { LegalUpdate } from '../types';

// This file contains mock data to be used in place of the Google Apps Script API,
// which is blocked by the environment's Content Security Policy (CSP).

// --- Mock Data for Acts ---
export const mockActs = [
    { id: 1, slug: 'bns', name: 'Bharatiya Nyaya Sanhita (BNS)', description: 'Replaces the Indian Penal Code, 1860, redefining offenses and punishments.', sectionsCount: 358, casesLinked: '4,200+' },
    { id: 2, slug: 'bnss', name: 'Bharatiya Nagarik Suraksha Sanhita (BNSS)', description: 'Replaces the Code of Criminal Procedure, 1973, streamlining legal procedures.', sectionsCount: 531, casesLinked: '8,500+' },
    { id: 3, slug: 'bsa', name: 'Bharatiya Sakshya Adhiniyam (BSA)', description: 'Replaces the Indian Evidence Act, 1872, modernizing rules for evidence.', sectionsCount: 170, casesLinked: '3,100+' },
];

// --- Mock Data for Chapters ---
export const mockChapters = [
    // BNS Chapters (Sample)
    { id: 1, actSlug: 'bns', chapterNumber: 1, title: 'Preliminary', description: 'Short title, commencement, and application.' },
    { id: 2, actSlug: 'bns', chapterNumber: 2, title: 'Of Punishments', description: 'Describes the various punishments applicable under this Sanhita.' },
    { id: 3, actSlug: 'bns', chapterNumber: 3, title: 'General Exceptions', description: 'Acts which are not considered offenses.' },
    { id: 4, actSlug: 'bns', chapterNumber: 4, title: 'Of Abetment, Criminal Conspiracy and Attempt', description: 'Defines inchoate offenses.' },
    { id: 5, actSlug: 'bns', chapterNumber: 5, title: 'Of Offences Against Women and Children', description: 'Specific provisions related to the protection of women and children.' },
    // BNSS Chapters (Sample)
    { id: 6, actSlug: 'bnss', chapterNumber: 1, title: 'Preliminary', description: 'Scope and definitions of the BNSS.' },
    { id: 7, actSlug: 'bnss', chapterNumber: 2, title: 'Constitution of Criminal Courts and Offices', description: 'Hierarchy and powers of criminal courts.' },
    // BSA Chapters (Sample)
    { id: 8, actSlug: 'bsa', chapterNumber: 1, title: 'Preliminary', description: 'Introduction to the rules of evidence.' },
    { id: 9, actSlug: 'bsa', chapterNumber: 2, title: 'Of the Relevancy of Facts', description: 'What facts may be proved in a court of law.' },
];

// --- Mock Data for Sections ---
export const mockSections = [
    // Sections for BNS Chapter 5
    { id: 101, chapterId: 5, sectionNumber: 69, title: 'Sexual intercourse by deceitful means, etc.', text: 'Whoever, by deceitful means or by making a promise to marry to a woman with the intention of not fulfilling the same, has sexual intercourse with her, such sexual intercourse not amounting to the offence of rape, shall be punished with imprisonment of either description for a term which may extend to ten years and shall also be liable to fine.' },
    { id: 102, chapterId: 5, sectionNumber: 70, title: 'Voyeurism', text: 'Any man who watches, or captures the image of a woman engaging in a private act in circumstances where she would usually have the expectation of not being observed either by the perpetrator or by any other person at the behest of the perpetrator or disseminates such image shall be punished...' },
    // Sections for BNSS Chapter 2
    { id: 201, chapterId: 7, sectionNumber: 6, title: 'Classes of Criminal Courts', text: 'Besides the High Courts and the Courts constituted under any law, other than this Sanhita, there shall be, in every State, the following classes of Criminal Courts, namely:— (i) Courts of Session; (ii) Judicial Magistrates of the first class and, in any metropolitan area, Metropolitan Magistrates; (iii) Judicial Magistrates of the second class; and (iv) Executive Magistrates.' },
    // Sections for BSA Chapter 2
    { id: 301, chapterId: 9, sectionNumber: 5, title: 'Facts forming part of same transaction', text: 'Facts which, though not in issue, are so connected with a fact in issue as to form part of the same transaction, are relevant, whether they occurred at the same time and place or at different times and places.' },
    { id: 302, chapterId: 9, sectionNumber: 6, title: 'Facts which are the occasion, cause or effect of facts in issue', text: 'Facts which are the occasion, cause or effect, immediate or otherwise, of relevant facts, or facts in issue, or which constitute the state of things under which they happened, or which afforded an opportunity for their occurrence or transaction, are relevant.' },
];

// --- Mock Data for Legal Updates ---
export const mockLegalUpdates: LegalUpdate[] = [
    { id: '1', title: 'Supreme Court clarifies stance on anticipatory bail under BNSS', summary: 'The Supreme Court issued new guidelines regarding the application of anticipatory bail provisions under the new Bharatiya Nagarik Suraksha Sanhita.', topic: 'BNSS', date: new Date('2024-07-15T09:00:00Z'), link: '#' },
    { id: '2', title: 'Delhi High Court admits first case challenging digital evidence under BSA', summary: 'A landmark case has been admitted to examine the admissibility of electronic records and digital evidence as per the newly enacted Bharatiya Sakshya Adhiniyam.', topic: 'BSA', date: new Date('2024-07-14T14:30:00Z'), link: '#' },
    { id: '3', title: 'BNS Section on Organized Crime: A Detailed Analysis', summary: 'Legal experts break down the implications of the new section on organized crime in the Bharatiya Nyaya Sanhita, comparing it with previous MCOCA provisions.', topic: 'BNS', date: new Date('2024-07-13T11:00:00Z'), link: '#' },
    { id: '4', title: 'Government Notifies E-Filing Rules Under New Criminal Laws', summary: 'The Central Government has officially notified the rules for mandatory e-filing of FIRs and charge sheets in accordance with the BNSS.', topic: 'BNSS', date: new Date('2024-07-12T18:00:00Z'), link: '#' },
    { id: '5', title: 'Impact of BSA on Forensic Evidence in Criminal Trials', summary: 'A comprehensive review of how the Bharatiya Sakshya Adhiniyam will change the way forensic evidence is presented and challenged in court.', topic: 'BSA', date: new Date('2024-07-11T10:00:00Z'), link: '#' }
];
