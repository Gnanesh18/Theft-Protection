import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { generateFIRReportPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, ArrowRight, Upload, ChevronRight, FileText, X, CheckCircle2 } from 'lucide-react';
import MapSelector from '../components/MapSelector';

const ReportTheft = () => {
  const navigate = useNavigate();

  // Multi-step Wizard: Step 1 (Incident Specs), Step 2 (Location mapping), Step 3 (Evidence uploads & filing)
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    theftType: 'Mobile Theft',
    description: '',
    incidentDate: '',
    incidentTime: '',
    coordinates: [-73.98513, 40.758896], // Default Times Square [lng, lat]
    address: ''
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filedCase, setFiledCase] = useState(null); // Receipt screen data
  const [error, setError] = useState('');

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinatesChange = (coords) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }));
  };

  const handleAddressFetch = (addr) => {
    setFormData((prev) => ({ ...prev, address: addr }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Add to file list
    setFiles([...files, ...selectedFiles]);

    // Create previews
    const newPreviews = selectedFiles.map(file => {
      if (file.type.startsWith('image/')) {
        return { name: file.name, type: 'image', url: URL.createObjectURL(file) };
      } else if (file.type.startsWith('video/')) {
        return { name: file.name, type: 'video', url: '' };
      } else {
        return { name: file.name, type: 'document', url: '' };
      }
    });
    setFilePreviews([...filePreviews, ...newPreviews]);
  };

  const removeFile = (idx) => {
    const updatedFiles = [...files];
    updatedFiles.splice(idx, 1);
    setFiles(updatedFiles);

    const updatedPreviews = [...filePreviews];
    // Revoke object URL to prevent leaks
    if (updatedPreviews[idx].type === 'image') {
      URL.revokeObjectURL(updatedPreviews[idx].url);
    }
    updatedPreviews.splice(idx, 1);
    setFilePreviews(updatedPreviews);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.description || !formData.incidentDate || !formData.incidentTime) {
        return setError('Please fill in all incident details before proceeding.');
      }
    } else if (step === 2) {
      if (!formData.address) {
        return setError('Please select a location on the map to resolve the address.');
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmitReport = async () => {
    setError('');
    setSubmitting(true);

    const formPayload = new FormData();
    formPayload.append('theftType', formData.theftType);
    formPayload.append('description', formData.description);
    
    // Merge Date and Time
    const incidentDateTime = `${formData.incidentDate}T${formData.incidentTime}`;
    formPayload.append('incidentDate', new Date(incidentDateTime).toISOString());
    
    formPayload.append('coordinates', JSON.stringify(formData.coordinates));
    formPayload.append('address', formData.address);

    // Append evidence files
    files.forEach(file => {
      formPayload.append('evidence', file);
    });

    try {
      const res = await axios.post('http://localhost:5001/api/cases', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFiledCase(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit report. Please review server logs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-grow">
      
      {/* Go Back Link */}
      <Link to="/citizen" className="inline-flex items-center space-x-1.5 text-xs text-slate-light hover:text-white transition font-mono mb-6">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>CANCEL FILING & RETURN</span>
      </Link>

      {!filedCase ? (
        <div className="glass-card rounded-2xl p-6 md:p-8 shadow-glass border border-navy-border/60">
          
          {/* Header */}
          <div className="border-b border-navy-border/50 pb-4 mb-6">
            <h1 className="text-xl font-bold font-sans">Report Theft Incident</h1>
            <p className="text-xs text-slate-light mt-1">Submit digital claims dossier. Provide timestamps, map location pin, and evidence files.</p>
          </div>

          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between mb-8 font-mono text-[10px] text-slate-light">
            <div className={`flex items-center space-x-1 ${step >= 1 ? 'text-white font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 1 ? 'bg-navy-light border-navy-light text-black font-bold' : 'border-navy-border text-slate-light'}`}>1</span>
              <span>DETAILS</span>
            </div>
            <ChevronRight className="h-3 w-3 text-navy-border" />
            <div className={`flex items-center space-x-1 ${step >= 2 ? 'text-white font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 2 ? 'bg-navy-light border-navy-light text-black font-bold' : 'border-navy-border text-slate-light'}`}>2</span>
              <span>LOCATION PIN</span>
            </div>
            <ChevronRight className="h-3 w-3 text-navy-border" />
            <div className={`flex items-center space-x-1 ${step >= 3 ? 'text-white font-bold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border ${step >= 3 ? 'bg-navy-light border-navy-light text-black font-bold' : 'border-navy-border text-slate-light'}`}>3</span>
              <span>EVIDENCE FILE</span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-safety-crimson/10 border border-safety-crimson/30 rounded-lg text-xs text-safety-crimson font-mono flex items-center space-x-2">
              <Shield className="h-4 w-4 shrink-0 animate-bounce" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Step Content */}
          <div className="space-y-6">
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">THEFT CLASSIFICATION</label>
                  <select
                    name="theftType"
                    value={formData.theftType}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm glass-input font-semibold"
                  >
                    <option value="Mobile Theft">Mobile Theft (Smartphone, Tablet, Smartwatch)</option>
                    <option value="Vehicle Theft">Vehicle Theft (Car, Bike, Scooter, Parts)</option>
                    <option value="Burglary">Burglary (Home break-in, Office trespass)</option>
                    <option value="Document Theft">Document Theft (Passport, ID card, Certificates)</option>
                    <option value="Other">Other Larceny / Pickpocketing</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">INCIDENT DATE</label>
                    <div className="relative">
                      <input
                        type="date"
                        name="incidentDate"
                        value={formData.incidentDate}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2.5 rounded-lg text-sm glass-input font-mono"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">APPROXIMATE TIME</label>
                    <div className="relative">
                      <input
                        type="time"
                        name="incidentTime"
                        value={formData.incidentTime}
                        onChange={handleTextChange}
                        className="w-full px-3 py-2.5 rounded-lg text-sm glass-input font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">STATUTORY INCIDENT DESCRIPTION</label>
                  <textarea
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleTextChange}
                    className="w-full px-3 py-2.5 rounded-lg text-sm glass-input leading-relaxed"
                    placeholder="Provide a detailed explanation of the event. Mention physical descriptions of suspect(s), items stolen, serial numbers, and any nearby cameras or witnesses."
                    required
                  ></textarea>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {/* Custom Map Component wrapper */}
                <MapSelector
                  value={formData.coordinates}
                  onChange={handleCoordinatesChange}
                  onAddressFetch={handleAddressFetch}
                />

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-light mb-1.5">RESOLVED GEOGRAPHIC ADDRESS</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleAddressFetch(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm glass-input font-sans bg-navy-dark/70"
                    placeholder="Click map above to auto-geocode the address details"
                    required
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="border border-dashed border-navy-border bg-navy-dark/30 rounded-xl p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-light mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Upload Evidence Files</h4>
                  <p className="text-xs text-slate-light mt-1 max-w-sm mx-auto leading-relaxed font-sans">
                    Attach images (invoice, device photo), security camera clips (mp4), or supporting PDFs. Maximum size 10MB per file.
                  </p>
                  <input
                    type="file"
                    id="evidence-file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,application/pdf"
                  />
                  <label
                    htmlFor="evidence-file"
                    className="inline-block mt-4 px-4 py-2 bg-navy-light hover:bg-[#2C4F72] text-xs font-semibold rounded cursor-pointer transition border border-navy-border"
                  >
                    SELECT FILES TO UPLOAD
                  </label>
                </div>

                {/* Previews */}
                {filePreviews.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-mono uppercase text-slate-light">UPLOAD QUEUE ({files.length})</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {filePreviews.map((preview, idx) => (
                        <div key={idx} className="relative group bg-[#14253B] rounded-lg border border-navy-border p-2 flex items-center space-x-2 text-xs">
                          {preview.type === 'image' ? (
                            <img src={preview.url} className="w-8 h-8 rounded object-cover shrink-0" alt="Preview" />
                          ) : (
                            <FileText className="w-8 h-8 text-blue-400 shrink-0" />
                          )}
                          <span className="truncate text-slate-300 flex-1 font-mono text-[10px]">{preview.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 p-0.5 bg-safety-crimson text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-navy-border/50 pt-6 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-navy-border hover:bg-navy-light/10 text-xs font-semibold rounded-lg text-slate-light hover:text-navy-light transition flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>PREVIOUS</span>
              </button>
            ) : (
              <div></div>
            )}
 
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 bg-navy-light hover:bg-[#C5933E] text-xs font-semibold rounded-lg text-black transition flex items-center space-x-1.5 font-bold"
              >
                <span>CONTINUE</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={submitting}
                className="px-8 py-2 bg-navy-light hover:bg-[#C5933E] text-xs font-bold rounded-lg text-black transition shadow-[0_0_12px_rgba(217,167,82,0.2)]"
              >
                {submitting ? 'COMPILING REPORT DOSSIER...' : 'SUBMIT REPORT TO PRECINCT'}
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Docket Receipt Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 md:p-8 border-t-4 border-t-safety-emerald shadow-glass border border-navy-border/60 text-center space-y-6"
        >
          <div className="mx-auto h-14 w-14 bg-safety-emerald/10 border border-safety-emerald/30 rounded-full flex items-center justify-center text-safety-emerald">
            <CheckCircle2 className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-safety-emerald font-bold tracking-widest uppercase">THEFT REPORT SUCCESSFULLY LOCK FILED</span>
            <h1 className="text-2xl font-bold font-sans">Report Locked & Certified</h1>
            <p className="text-xs text-slate-light">Your case reference token has been generated by public safety algorithms.</p>
          </div>

          {/* Receipt details */}
          <div className="max-w-md mx-auto bg-navy-dark/60 border border-navy-border/70 rounded-xl p-5 text-left font-mono text-xs space-y-3 shadow-inner">
            <div className="flex justify-between border-b border-navy-border/50 pb-2">
              <span className="text-slate-gray">CASE REFERENCE:</span>
              <span className="text-white font-bold">{filedCase.caseId}</span>
            </div>
            <div className="flex justify-between border-b border-navy-border/50 pb-2">
              <span className="text-slate-gray">THEFT CATEGORY:</span>
              <span className="text-slate-200 font-semibold">{filedCase.theftType}</span>
            </div>
            <div className="flex justify-between border-b border-navy-border/50 pb-2">
              <span className="text-slate-gray">INCIDENT DATE:</span>
              <span className="text-slate-200">{new Date(filedCase.incidentDate).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col border-b border-navy-border/50 pb-2">
              <span className="text-slate-gray mb-1">MAPPED LOCATION:</span>
              <span className="text-slate-200 leading-relaxed truncate">{filedCase.location.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-gray">FILING STATUS:</span>
              <span className="text-safety-crimson font-bold uppercase">{filedCase.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto pt-4">
            <button
              onClick={() => generateFIRReportPDF(filedCase)}
              className="w-full px-6 py-2.5 bg-navy-light hover:bg-[#2C4F72] text-xs font-semibold rounded text-white flex items-center justify-center space-x-1.5 transition border border-navy-border shadow-md"
            >
              <FileText className="h-4 w-4" />
              <span>DOWNLOAD CERTIFIED FIR PDF</span>
            </button>
            <button
              onClick={() => navigate('/citizen')}
              className="w-full px-6 py-2.5 bg-safety-emerald hover:bg-emerald-600 text-xs font-semibold rounded text-white transition flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <span>ACCESS CITIZEN DASHBOARD</span>
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default ReportTheft;