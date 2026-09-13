import React, { useState } from 'react';
import { MOCK_STUDIES } from '../services/mockData';
import StudyCard from '../components/study/StudyCard';
import { Search, Filter, FileSpreadsheet } from 'lucide-react';

export default function Studies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredStudies = MOCK_STUDIES.filter((study) => {
    const matchesSearch =
      study.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (study.patient?.patient_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (study.patient?.display_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || study.review_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 dashed-ink-divider flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="peach-pill-banner text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              SPECIMEN REPOSITORY
            </span>
          </div>
          <h1
            className="text-2xl font-bold text-[#0b245c]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Clinical MRI Studies Directory
          </h1>
          <p className="text-xs text-[#53658D]">
            Select a study to perform AI analysis, radiologist review, and LLM report generation.
          </p>
        </div>
      </div>

      {/* Filter and Search controls in Archival Plate */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 plate-card p-3.5 rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#53658D] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient ID or Study UID..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#F2F3FF] border border-[#34497F] rounded text-[#0b245c] font-medium focus:outline-none focus:border-[#0b245c]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-[#53658D]" />
          <span className="text-xs text-[#0b245c] font-bold uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F2F3FF] border border-[#34497F] rounded px-3 py-1.5 text-[#0b245c] font-bold uppercase tracking-wider focus:outline-none"
          >
            <option value="ALL">All Studies</option>
            <option value="PENDING">Pending Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Grid of Study Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudies.length > 0 ? (
          filteredStudies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-[#53658D] plate-card rounded-lg">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50 text-[#0b245c]" />
            <p className="text-sm font-bold text-[#0b245c]">No matching clinical studies found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
