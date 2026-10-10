import { AppLayout } from '../../components/website/AppLayout';
import { SEOConfig } from '../../config/seo';
import { Download, FileText, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { usePublicTimetables } from '../../hooks/useTimetables';

import { TimetableConfig } from '../../types/timetable';

export const TimetablePage = () => {
  const { data: timetables, isLoading, isError } = usePublicTimetables();
  
  const bece = timetables?.find((t: TimetableConfig) => t.type === 'BECE');
  const wassce = timetables?.find((t: TimetableConfig) => t.type === 'WASSCE_NOVDEC');

  const customSeo: SEOConfig = {
    title: "Official WAEC Timetables 2026 - BECE & WASSCE / NOVDEC | CivicTree",
    description: "Download the official WAEC BECE and WASSCE 2026 examination timetables in PDF format. Free download provided by CivicTree.",
    keywords: [
      "WAEC timetable",
      "BECE timetable 2026",
      "WASSCE timetable 2026",
      "NOVDEC timetable",
      "CivicTree timetable",
      "WAEC timetable download PDF",
    ],
  };

  return (
    <AppLayout seoConfig={customSeo}>
      <div>
        {/* Download Cards - Side by Side */}
        <section className="bg-bg-secondary">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-text-secondary font-medium">Loading official timetables...</p>
              </div>
            ) : isError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center flex flex-col items-center justify-center">
                <AlertCircle className="mb-2" size={32} />
                <p className="font-bold">Failed to load timetables</p>
                <p className="text-sm mt-1">Please try again later or check your internet connection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* BECE Card */}
                {bece && bece.isPublished ? (
                  <div className="bg-white rounded-2xl shadow-md border border-border p-6 md:p-8 text-center flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-primary" size={24} />
                    </div>
                    <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary mb-2">
                      {bece.title}
                    </h2>
                    <p className="font-sans text-sm text-text-secondary mb-6 flex-grow">
                      {bece.description}
                    </p>
                    {bece.startDate && (
                      <div className="mb-4 text-xs font-semibold text-primary bg-primary/5 py-1.5 px-3 rounded-lg inline-block mx-auto">
                        Expected Start: {new Date(bece.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    <a
                      href={bece.fileUrl}
                      download={bece.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-[#346231] hover:bg-[#1a3319] text-white font-sans font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors text-base"
                    >
                      <Download size={18} />
                      Download BECE PDF {bece.fileSize ? `(${bece.fileSize})` : ''}
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-6 md:p-8 text-center flex flex-col items-center justify-center">
                    <Calendar className="text-gray-400 mb-3" size={32} />
                    <h3 className="font-bold text-lg text-text-primary mb-1">BECE Timetable</h3>
                    <p className="text-xs text-text-secondary">The BECE examination timetable will be published soon.</p>
                  </div>
                )}

                {/* WASSCE Card */}
                {wassce && wassce.isPublished ? (
                  <div className="bg-white rounded-2xl shadow-md border border-border p-6 md:p-8 text-center flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-cta/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-[#ebc56b]" size={24} />
                    </div>
                    <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary mb-2">
                      {wassce.title}
                    </h2>
                    <p className="font-sans text-sm text-text-secondary mb-6 flex-grow">
                      {wassce.description}
                    </p>
                    {wassce.startDate && (
                      <div className="mb-4 text-xs font-semibold text-amber-800 bg-amber-50 py-1.5 px-3 rounded-lg inline-block mx-auto">
                        Expected Start: {new Date(wassce.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    <a
                      href={wassce.fileUrl}
                      download={wassce.fileName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full bg-[#ebc56b] hover:bg-[#d4a84a] text-[#371f0d] font-sans font-bold py-3.5 px-6 rounded-xl shadow-md transition-colors text-base"
                    >
                      <Download size={18} />
                      Download WASSCE PDF {wassce.fileSize ? `(${wassce.fileSize})` : ''}
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-6 md:p-8 text-center flex flex-col items-center justify-center">
                    <Calendar className="text-gray-400 mb-3" size={32} />
                    <h3 className="font-bold text-lg text-text-primary mb-1">WASSCE Timetable</h3>
                    <p className="text-xs text-text-secondary">The WASSCE examination timetable will be published soon.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* USSD + Steps - Side by Side */}
        <section>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* USSD Card */}
              <div className="bg-white rounded-2xl shadow-md border border-border p-5 md:p-7 text-center self-start">
                <h2 className="font-heading font-bold text-lg md:text-xl text-text-primary mb-2">
                  Buy Voucher via USSD
                </h2>
                <p className="font-sans text-xs text-text-secondary mb-4">
                  No smartphone or internet needed.
                </p>
                <div className="inline-block bg-[#ebc56b] border-l-4 border-[#371f0d] px-8 py-4 rounded-r-lg font-mono text-4xl md:text-6xl text-[#371f0d] font-bold shadow-md">
                  *713*5912#
                </div>
              </div>

              {/* Steps Card */}
              <div className="bg-white rounded-2xl shadow-md border border-border p-6 md:p-8">
                <h2 className="font-heading font-bold text-xl md:text-2xl text-text-primary mb-4 text-center">
                  Steps Made Simple
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Main Menu', code: '*713*5912#' },
                    { label: 'Buy Voucher', code: '1. Buy Voucher\n2. Check Voucher' },
                    { label: 'Select Type', code: '1. BECE\n2. WASSCE / NOVDEC' },
                    { label: 'Confirm', code: 'System: You are buying 2 vouchers.\nTotal: GHS XX\n1. Confirm  2. Cancel' },
                    { label: 'Success', code: 'Payment successful!\nYour voucher codes:\n- ABCD-1234\n- WXYZ-5678' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-bold text-sm text-text-primary mb-1">{item.label}</h3>
                        <pre className="bg-bg-secondary rounded-lg p-2.5 font-mono text-xs text-text-primary whitespace-pre-wrap leading-relaxed">{item.code}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-bg-secondary">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-text-primary mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: 'When is the BECE 2026 examination?',
                  a: 'The BECE 2026 exam dates are in the official timetable PDF above. Download it for the full daily schedule of all 10 subjects.',
                },
                {
                  q: 'What subjects are on the BECE 2026 timetable?',
                  a: 'The BECE 2026 covers 10 subjects: English Language, Mathematics, Integrated Science, Social Studies, RME, Creative Arts & Design, Career Technology, Computing, Ghanaian Language, and Arabic.',
                },
                {
                  q: 'How do I check my BECE 2026 results?',
                  a: 'Dial *713*5912# to buy a BECE result checker voucher. Receive your serial number and PIN via SMS, then visit eresults.waecgh.org to view results.',
                },
                {
                  q: 'Is the BECE timetable PDF free?',
                  a: 'Yes, the BECE 2026 timetable PDF is completely free to download from this page.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-border p-5">
                  <h3 className="font-heading font-semibold text-text-primary mb-1.5 text-base">
                    {item.q}
                  </h3>
                  <p className="font-sans text-sm text-text-secondary leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};
