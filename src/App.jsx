import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link, Mail, Trash2, ExternalLink, FileText, Download, UploadCloud, AlertCircle } from 'lucide-react';

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [emailConnected, setEmailConnected] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({ company: '', position: '', url: '', status: 'Applied' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.storage.list('job:');
      if (result && result.keys && result.keys.length > 0) {
        const jobPromises = result.keys.map(async (key) => {
          try {
            const data = await window.storage.get(key);
            if (!data || !data.value) return null;
            
            const parsed = JSON.parse(data.value);
            // Validate job structure
            if (!parsed.id || !parsed.company || !parsed.position) {
              console.warn(`Invalid job data for key ${key}`);
              return null;
            }
            return parsed;
          } catch (err) {
            console.error(`Error loading job ${key}:`, err);
            return null;
          }
        });
        
        const jobData = await Promise.all(jobPromises);
        const validJobs = jobData.filter(Boolean);
        setJobs(validJobs.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setError('Failed to load applications. Please refresh the page.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file is too large. Maximum size is 10MB.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const text = await extractPdfText(file);
      const jobInfo = parseJobInfo(text);
      setNewJob({ ...newJob, ...jobInfo });
      setShowAddModal(true);
    } catch (error) {
      console.error('PDF parsing error:', error);
      setError('Could not read PDF. Please enter details manually.');
      setTimeout(() => setError(null), 3000);
      setShowAddModal(true);
    }
  };

  const extractPdfText = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      const timeout = setTimeout(() => {
        reader.abort();
        reject(new Error('PDF reading timeout'));
      }, 5000);

      reader.onload = () => {
        clearTimeout(timeout);
        resolve(reader.result);
      };
      
      reader.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const parseJobInfo = (text) => {
    try {
      const lines = text.split('\n').filter(l => l && l.trim());
      return {
        company: (lines[0]?.substring(0, 100) || '').trim(),
        position: (lines[1]?.substring(0, 100) || '').trim(),
        url: ''
      };
    } catch (err) {
      console.error('Parse error:', err);
      return { company: '', position: '', url: '' };
    }
  };

  const sanitizeInput = (input, maxLength = 200) => {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  };

  const validateUrl = (url) => {
    if (!url) return true; // URL is optional
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const addJob = async () => {
    const company = sanitizeInput(newJob.company);
    const position = sanitizeInput(newJob.position);
    const url = sanitizeInput(newJob.url, 500);

    if (!company || !position) {
      setError('Company and position are required');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (url && !validateUrl(url)) {
      setError('Please enter a valid URL (starting with http:// or https://)');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const job = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      company,
      position,
      url,
      status: newJob.status || 'Applied',
      timestamp: Date.now(),
      lastUpdate: Date.now()
    };

    try {
      const serialized = JSON.stringify(job);
      // Check if serialized data is too large (approaching 5MB limit)
      if (serialized.length > 4.5 * 1024 * 1024) {
        setError('Job data is too large. Please reduce the amount of information.');
        return;
      }

      await window.storage.set(`job:${job.id}`, serialized);
      await loadJobs();
      setShowAddModal(false);
      setNewJob({ company: '', position: '', url: '', status: 'Applied' });
      setError(null);
    } catch (error) {
      console.error('Error saving job:', error);
      setError('Failed to save application. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateJobStatus = async (id, status) => {
    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      console.error('Invalid status:', status);
      return;
    }

    try {
      const result = await window.storage.get(`job:${id}`);
      if (!result || !result.value) {
        setError('Job not found');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const job = JSON.parse(result.value);
      job.status = status;
      job.lastUpdate = Date.now();
      
      await window.storage.set(`job:${id}`, JSON.stringify(job));
      await loadJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      setError('Failed to update status. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const deleteJob = async (id) => {
    if (!id) return;
    
    if (!confirm('Delete this application? This action cannot be undone.')) return;
    
    try {
      await window.storage.delete(`job:${id}`);
      await loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete application. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const connectEmail = () => {
    setEmailConnected(true);
    alert('Email monitoring simulated. In production, this would connect to your email via OAuth and monitor for responses from companies.');
  };

  const exportToJSON = () => {
    if (!jobs || jobs.length === 0) {
      setError('No applications to export');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        jobs: jobs
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const exportToDrive = () => {
    alert('In production, this would:\n1. Authenticate with Google Drive API\n2. Save your job tracker data as a JSON file\n3. Auto-sync changes\n\nFor now, use "Export" and manually upload to your Drive.');
    exportToJSON();
  };

  const importFromJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (importInputRef.current) {
      importInputRef.current.value = '';
    }

    // File size check
    if (file.size > 10 * 1024 * 1024) {
      setError('Import file is too large. Maximum size is 10MB.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const reader = new FileReader();
    
    reader.onerror = () => {
      setError('Failed to read file');
      setTimeout(() => setError(null), 3000);
    };

    reader.onload = async (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Invalid file content');
        }

        const parsed = JSON.parse(content);
        
        // Handle both old format (array) and new format (object with version)
        let importedJobs = [];
        if (Array.isArray(parsed)) {
          importedJobs = parsed;
        } else if (parsed.jobs && Array.isArray(parsed.jobs)) {
          importedJobs = parsed.jobs;
        } else {
          throw new Error('Invalid file format');
        }

        if (importedJobs.length === 0) {
          setError('No applications found in file');
          setTimeout(() => setError(null), 3000);
          return;
        }

        // Validate and sanitize imported jobs
        const validJobs = importedJobs.filter(job => {
          return job && 
                 typeof job === 'object' && 
                 job.company && 
                 job.position &&
                 job.id;
        });

        if (validJobs.length === 0) {
          throw new Error('No valid applications found in file');
        }

        // Ask for confirmation if jobs already exist
        if (jobs.length > 0) {
          const confirmMsg = `You have ${jobs.length} existing application(s). Import will add ${validJobs.length} more. Continue?`;
          if (!confirm(confirmMsg)) return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const job of validJobs) {
          try {
            // Ensure job has required fields with defaults
            const sanitizedJob = {
              id: job.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              company: sanitizeInput(job.company),
              position: sanitizeInput(job.position),
              url: sanitizeInput(job.url || '', 500),
              status: ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'].includes(job.status) 
                ? job.status 
                : 'Applied',
              timestamp: job.timestamp || Date.now(),
              lastUpdate: job.lastUpdate || Date.now()
            };

            await window.storage.set(`job:${sanitizedJob.id}`, JSON.stringify(sanitizedJob));
            successCount++;
          } catch (err) {
            console.error('Error importing job:', job, err);
            failCount++;
          }
        }
        
        await loadJobs();
        
        if (failCount > 0) {
          setError(`Imported ${successCount} applications. ${failCount} failed.`);
        } else {
          setError(`Successfully imported ${successCount} applications`);
        }
        setTimeout(() => setError(null), 5000);
        
      } catch (error) {
        console.error('Import error:', error);
        setError('Error importing file. Please check the file format.');
        setTimeout(() => setError(null), 3000);
      }
    };
    
    reader.readAsText(file);
  };

  const statusColors = {
    'Applied': 'bg-blue-100 text-blue-800',
    'Interview': 'bg-yellow-100 text-yellow-800',
    'Offer': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Withdrawn': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Job Application Tracker</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition">
              <Upload size={20} />
              <span>Upload PDF</span>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <Link size={20} />
              <span>Add URL</span>
            </button>
            
            <button
              onClick={connectEmail}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                emailConnected 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <Mail size={20} />
              <span>{emailConnected ? 'Connected' : 'Connect Email'}</span>
            </button>

            <div className="ml-auto flex gap-2">
              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={jobs.length === 0}
                title={jobs.length === 0 ? 'No applications to export' : 'Export all applications'}
              >
                <Download size={20} />
                <span>Export</span>
              </button>

              <button
                onClick={exportToDrive}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={jobs.length === 0}
                title={jobs.length === 0 ? 'No applications to save' : 'Save to Google Drive'}
              >
                <UploadCloud size={20} />
                <span>Save to Drive</span>
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg cursor-pointer hover:border-gray-400 transition">
                <Upload size={20} />
                <span>Import</span>
                <input 
                  ref={importInputRef}
                  type="file" 
                  accept=".json" 
                  onChange={importFromJSON} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>

          {emailConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-800">
              Email monitoring active. Status will update automatically when responses are detected.
            </div>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p>Loading applications...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No applications yet. Upload a PDF or add a job posting URL to get started.</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{job.position}</h3>
                      <p className="text-gray-600 truncate">{job.company}</p>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm flex items-center gap-1 mt-1 hover:underline truncate"
                        >
                          <span className="truncate">View posting</span>
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Applied {new Date(job.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[job.status]} cursor-pointer`}
                        aria-label={`Status for ${job.position} at ${job.company}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                      
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition"
                        aria-label={`Delete application for ${job.position} at ${job.company}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add Job Application</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="company-input" className="block text-sm font-medium mb-1">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company-input"
                    type="text"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Google"
                    maxLength={100}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="position-input" className="block text-sm font-medium mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="position-input"
                    type="text"
                    value={newJob.position}
                    onChange={(e) => setNewJob({ ...newJob, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Software Engineer"
                    maxLength={100}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="url-input" className="block text-sm font-medium mb-1">
                    Job Posting URL
                  </label>
                  <input
                    id="url-input"
                    type="url"
                    value={newJob.url}
                    onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                    maxLength={500}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={addJob}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Application
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewJob({ company: '', position: '', url: '', status: 'Applied' });
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}