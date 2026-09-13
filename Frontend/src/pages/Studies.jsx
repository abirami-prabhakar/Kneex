import React, { useState } from 'react';
import { MOCK_STUDIES } from '../services/mockData';
import StudyCard from '../components/study/StudyCard';
import { Search, Filter, Plus, FileSpreadsheet } from 'lucide-react';

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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinical MRI Studies Directory</h1>
          <p className="text-xs text-slate-500">
            Select a study to perform AI analysis, radiologist review, and LLM report generation.
          </p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Patient ID or Study UID..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none"
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
          <div className="col-span-full py-12 text-center text-slate-400">
            <FileSpreadsheet className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No matching clinical studies found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
