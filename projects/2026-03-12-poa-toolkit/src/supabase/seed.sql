-- ConcretePOA Seed Data: 10 Major US Banks
-- Run after schema.sql

-- ============================================================
-- BANKS
-- ============================================================
insert into public.banks (id, name, slug, website, poa_phone, poa_email, processing_time_days, accepts_springing_poa, accepts_durable_poa, requires_notarization, requires_medallion, allows_remote_submission, notes) values
  ('b0000001-0000-0000-0000-000000000001', 'JPMorgan Chase', 'chase', 'https://www.chase.com', '1-800-935-9935', null, 10, false, true, true, false, false, 'Chase typically requires their own internal POA form in addition to your document. Branch visit strongly recommended.'),
  ('b0000001-0000-0000-0000-000000000002', 'Bank of America', 'bank-of-america', 'https://www.bankofamerica.com', '1-800-432-1000', null, 14, true, true, true, false, false, 'BofA has a dedicated POA processing department. Allow extra time for review. They may require a legal opinion letter for older POAs.'),
  ('b0000001-0000-0000-0000-000000000003', 'Wells Fargo', 'wells-fargo', 'https://www.wellsfargo.com', '1-800-869-3557', null, 7, true, true, true, false, false, 'Wells Fargo generally has a faster review process. They accept both springing and durable POAs. Branch submission preferred.'),
  ('b0000001-0000-0000-0000-000000000004', 'Citibank', 'citibank', 'https://www.citibank.com', '1-800-374-9700', null, 14, false, true, true, true, false, 'Citi may require a Medallion Signature Guarantee for certain transactions. Their POA review can be lengthy.'),
  ('b0000001-0000-0000-0000-000000000005', 'US Bank', 'us-bank', 'https://www.usbank.com', '1-800-872-2657', null, 10, true, true, true, false, true, 'US Bank allows some remote submission via mail. They are generally flexible with POA types.'),
  ('b0000001-0000-0000-0000-000000000006', 'PNC Bank', 'pnc', 'https://www.pnc.com', '1-888-762-2265', null, 7, true, true, true, false, false, 'PNC has a relatively streamlined POA acceptance process. They accept most standard state POA forms.'),
  ('b0000001-0000-0000-0000-000000000007', 'Capital One', 'capital-one', 'https://www.capitalone.com', '1-800-655-2265', null, 10, false, true, true, false, true, 'Capital One allows mail-in POA submissions. They may require additional verification for high-value accounts.'),
  ('b0000001-0000-0000-0000-000000000008', 'TD Bank', 'td-bank', 'https://www.td.com', '1-888-751-9000', null, 5, true, true, true, false, false, 'TD Bank typically has one of the fastest POA processing times. Branch visit recommended for same-day processing.'),
  ('b0000001-0000-0000-0000-000000000009', 'Truist', 'truist', 'https://www.truist.com', '1-844-487-8478', null, 10, true, true, true, false, false, 'Truist (formerly BB&T/SunTrust) accepts most POA forms. They may request additional documentation for older POAs.'),
  ('b0000001-0000-0000-0000-000000000010', 'Regions Bank', 'regions', 'https://www.regions.com', '1-800-734-4667', null, 7, true, true, true, false, false, 'Regions Bank is generally flexible with POA acceptance. They have a dedicated estate services team.');

-- ============================================================
-- BANK REQUIREMENTS
-- ============================================================

-- Chase
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000001', 'document', 'Original or Certified Copy of POA', 'Must be the original notarized POA or a certified copy. Chase does not accept photocopies.', true, 1),
  ('b0000001-0000-0000-0000-000000000001', 'document', 'Chase Internal POA Form', 'Chase may require completion of their own internal POA acceptance form at the branch.', true, 2),
  ('b0000001-0000-0000-0000-000000000001', 'identification', 'Agent Photo ID', 'Valid government-issued photo ID of the agent (driver''s license or passport).', true, 3),
  ('b0000001-0000-0000-0000-000000000001', 'identification', 'Principal Photo ID', 'Copy of principal''s government-issued photo ID.', true, 4),
  ('b0000001-0000-0000-0000-000000000001', 'document', 'Notarization Certificate', 'POA must be notarized. Some states require specific notarial language.', true, 5),
  ('b0000001-0000-0000-0000-000000000001', 'form', 'Agent Signature Card', 'Agent must sign a new signature card at the branch.', true, 6),
  ('b0000001-0000-0000-0000-000000000001', 'other', 'Branch Visit Required', 'Agent must present documents in person at a Chase branch.', true, 7),
  ('b0000001-0000-0000-0000-000000000001', 'document', 'Affidavit of Agent', 'Sworn statement that the POA has not been revoked and the principal is still living.', false, 8);

-- Bank of America
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000002', 'document', 'Original or Certified POA', 'Original notarized POA document or court-certified copy required.', true, 1),
  ('b0000001-0000-0000-0000-000000000002', 'identification', 'Agent Government ID', 'Valid government-issued photo identification for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000002', 'identification', 'Principal ID Copy', 'Photocopy of the principal''s government-issued ID.', true, 3),
  ('b0000001-0000-0000-0000-000000000002', 'document', 'Notarized POA', 'Document must be properly notarized per state requirements.', true, 4),
  ('b0000001-0000-0000-0000-000000000002', 'document', 'Legal Opinion Letter', 'For POAs older than 5 years, BofA may require an attorney''s opinion letter confirming validity.', false, 5),
  ('b0000001-0000-0000-0000-000000000002', 'form', 'BofA POA Intake Form', 'Bank of America''s internal POA processing form completed at branch.', true, 6),
  ('b0000001-0000-0000-0000-000000000002', 'document', 'Certification of Trust (if applicable)', 'If the POA interacts with trust accounts, trust certification may be needed.', false, 7),
  ('b0000001-0000-0000-0000-000000000002', 'other', 'In-Person Branch Visit', 'Agent must visit a BofA branch for initial POA submission.', true, 8);

-- Wells Fargo
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000003', 'document', 'Original POA Document', 'Original or certified copy of the Power of Attorney.', true, 1),
  ('b0000001-0000-0000-0000-000000000003', 'identification', 'Agent Valid ID', 'Government-issued photo ID for the appointed agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000003', 'identification', 'Principal ID', 'Copy of principal''s valid identification.', true, 3),
  ('b0000001-0000-0000-0000-000000000003', 'document', 'Notarization', 'POA must be notarized. Wells Fargo checks notarial compliance.', true, 4),
  ('b0000001-0000-0000-0000-000000000003', 'form', 'Wells Fargo Account Access Form', 'Internal form granting the agent access to specific accounts.', true, 5),
  ('b0000001-0000-0000-0000-000000000003', 'document', 'Agent Certification', 'Agent may need to sign a certification that the POA is still valid and has not been revoked.', true, 6),
  ('b0000001-0000-0000-0000-000000000003', 'other', 'Branch Appointment', 'Schedule a branch appointment for POA processing.', false, 7);

-- Citibank
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000004', 'document', 'Certified POA Copy', 'Original or court-certified copy of the Power of Attorney.', true, 1),
  ('b0000001-0000-0000-0000-000000000004', 'identification', 'Agent Photo ID', 'Two forms of identification for the agent, including one photo ID.', true, 2),
  ('b0000001-0000-0000-0000-000000000004', 'identification', 'Principal ID', 'Copy of principal''s government-issued ID.', true, 3),
  ('b0000001-0000-0000-0000-000000000004', 'document', 'Notarization with Apostille', 'POA must be notarized. International POAs may need apostille.', true, 4),
  ('b0000001-0000-0000-0000-000000000004', 'document', 'Medallion Signature Guarantee', 'Required for investment account transactions and transfers above certain thresholds.', true, 5),
  ('b0000001-0000-0000-0000-000000000004', 'form', 'Citi POA Registration Form', 'Citi''s proprietary POA registration form.', true, 6),
  ('b0000001-0000-0000-0000-000000000004', 'document', 'Physician''s Letter', 'If springing POA, medical documentation of principal''s incapacity may be required.', false, 7),
  ('b0000001-0000-0000-0000-000000000004', 'other', 'In-Branch Processing', 'Must be submitted at a Citibank branch. No remote submissions.', true, 8);

-- US Bank
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000005', 'document', 'Original POA', 'Original notarized Power of Attorney document.', true, 1),
  ('b0000001-0000-0000-0000-000000000005', 'identification', 'Agent ID', 'Valid government-issued photo ID for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000005', 'identification', 'Principal ID Copy', 'Copy of principal''s identification document.', true, 3),
  ('b0000001-0000-0000-0000-000000000005', 'document', 'Notarization', 'Document must be properly notarized.', true, 4),
  ('b0000001-0000-0000-0000-000000000005', 'form', 'US Bank POA Form', 'Internal POA acceptance form.', true, 5),
  ('b0000001-0000-0000-0000-000000000005', 'document', 'Agent Affidavit', 'Signed affidavit confirming POA validity and agent''s authority.', true, 6),
  ('b0000001-0000-0000-0000-000000000005', 'other', 'Mail or Branch Submission', 'Can be submitted by mail or at a branch location.', false, 7);

-- PNC Bank
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000006', 'document', 'Original or Certified POA', 'Original or certified copy of the Power of Attorney.', true, 1),
  ('b0000001-0000-0000-0000-000000000006', 'identification', 'Agent Photo ID', 'Government-issued photo ID for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000006', 'identification', 'Principal ID', 'Copy of principal''s ID document.', true, 3),
  ('b0000001-0000-0000-0000-000000000006', 'document', 'Notarization', 'POA must be notarized per state law.', true, 4),
  ('b0000001-0000-0000-0000-000000000006', 'form', 'PNC POA Acceptance Form', 'PNC''s internal POA acceptance documentation.', true, 5),
  ('b0000001-0000-0000-0000-000000000006', 'other', 'Branch Visit', 'Submit documents at any PNC branch location.', true, 6);

-- Capital One
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000007', 'document', 'Original POA Document', 'Original notarized POA or certified copy.', true, 1),
  ('b0000001-0000-0000-0000-000000000007', 'identification', 'Agent Government ID', 'Valid government-issued photo ID for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000007', 'identification', 'Principal ID Copy', 'Copy of principal''s government ID.', true, 3),
  ('b0000001-0000-0000-0000-000000000007', 'document', 'Notarization', 'POA must be properly notarized.', true, 4),
  ('b0000001-0000-0000-0000-000000000007', 'form', 'Capital One POA Form', 'Capital One''s internal POA processing form.', true, 5),
  ('b0000001-0000-0000-0000-000000000007', 'document', 'Account Verification', 'Documentation linking the principal to the Capital One account.', true, 6),
  ('b0000001-0000-0000-0000-000000000007', 'other', 'Mail or Branch Submission', 'Can submit via mail or visit a Capital One branch/café.', false, 7);

-- TD Bank
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000008', 'document', 'Original POA', 'Original or certified copy of Power of Attorney.', true, 1),
  ('b0000001-0000-0000-0000-000000000008', 'identification', 'Agent Photo ID', 'Valid photo identification for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000008', 'identification', 'Principal ID', 'Copy of principal''s ID.', true, 3),
  ('b0000001-0000-0000-0000-000000000008', 'document', 'Notarization', 'Properly notarized per applicable state law.', true, 4),
  ('b0000001-0000-0000-0000-000000000008', 'form', 'TD Bank POA Form', 'TD Bank''s own POA processing form.', true, 5),
  ('b0000001-0000-0000-0000-000000000008', 'other', 'Branch Visit Recommended', 'While not strictly required, branch visit speeds up processing significantly.', false, 6);

-- Truist
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000009', 'document', 'Original or Certified POA', 'Original notarized POA or court-certified copy.', true, 1),
  ('b0000001-0000-0000-0000-000000000009', 'identification', 'Agent Photo ID', 'Government-issued photo ID for the appointed agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000009', 'identification', 'Principal ID Copy', 'Copy of principal''s government ID.', true, 3),
  ('b0000001-0000-0000-0000-000000000009', 'document', 'Notarization', 'Must be notarized per state requirements.', true, 4),
  ('b0000001-0000-0000-0000-000000000009', 'form', 'Truist POA Intake Form', 'Truist''s internal POA acceptance form.', true, 5),
  ('b0000001-0000-0000-0000-000000000009', 'document', 'Agent Certification Statement', 'Signed statement certifying the POA remains valid.', true, 6),
  ('b0000001-0000-0000-0000-000000000009', 'other', 'Branch Submission', 'POA must be presented at a Truist branch.', true, 7);

-- Regions Bank
insert into public.bank_requirements (bank_id, category, title, description, is_required, sort_order) values
  ('b0000001-0000-0000-0000-000000000010', 'document', 'Original POA Document', 'Original or certified copy of the Power of Attorney.', true, 1),
  ('b0000001-0000-0000-0000-000000000010', 'identification', 'Agent Valid ID', 'Government-issued photo ID for the agent.', true, 2),
  ('b0000001-0000-0000-0000-000000000010', 'identification', 'Principal ID', 'Copy of principal''s identification.', true, 3),
  ('b0000001-0000-0000-0000-000000000010', 'document', 'Notarization', 'POA must be notarized.', true, 4),
  ('b0000001-0000-0000-0000-000000000010', 'form', 'Regions POA Form', 'Regions Bank internal POA acceptance form.', true, 5),
  ('b0000001-0000-0000-0000-000000000010', 'document', 'Agent Affidavit', 'Sworn affidavit that the POA is still in effect.', false, 6),
  ('b0000001-0000-0000-0000-000000000010', 'other', 'Branch Visit', 'Visit a Regions branch to submit POA documentation.', true, 7);
