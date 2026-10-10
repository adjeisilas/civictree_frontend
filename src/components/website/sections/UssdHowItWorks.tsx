import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface WizardStepData {
  id: number;
  label: string;
  subLabel: string;
  title: string;
  description: string;
  utilityNode: React.ReactNode;
}

export const UssdHowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps: WizardStepData[] = [
    {
      id: 1,
      label: 'Step 1',
      subLabel: 'Dial Code',
      title: 'Initiate Transaction Line',
      description:
        'Open your phone dialer app and enter our dedicated shortcode. No internet connection or active data subscription is required to run this session.',
      utilityNode: (
        <div className="inline-block bg-[#ebc56b] border-l-4 border-[#371f0d] px-8 py-4 rounded-r-lg font-mono text-2xl text-[#371f0d] font-bold shadow-md">
          *713*5912#
        </div>
      ),
    },
    {
      id: 2,
      label: 'Step 2',
      subLabel: 'Select Exam',
      title: 'Choose Examination Model',
      description:
        'An interactive menu overlay will prompt you on screen. Choose results checker type (BECE or WASSCE/NOVDEC).',
      utilityNode: (
        <div className="inline-block bg-bg-secondary border border-border rounded-lg p-4 font-mono text-sm text-text-primary shadow-sm space-y-1">
          <div>1) BECE</div>
          <div className="text-primary font-semibold">2) WASSCE / NOVDEC</div>
        </div>
      ),
    },
    {
      id: 3,
      label: 'Step 3',
      subLabel: 'Authorize Pay',
      title: 'Mobile Money Pin Confirmation',
      description:
        'Confirm the payment total requested on screen. Enter your secret service gateway mobile money PIN to approve the transaction.',
      utilityNode: (
         <div className="inline-block bg-[#ebc56b] border-l-4 border-[#371f0d] px-8 py-4 rounded-r-lg font-mono text-2xl text-[#371f0d] font-bold shadow-md">
            e.g 0000
        </div>
      ),
    },
    {
      id: 4,
      label: 'Step 4',
      subLabel: 'Receive Token',
      title: 'Voucher Transmitted Successfully',
      description:
        'The system displays your voucher details, dispatching copies directly to your screen immediately via standard cellular flash carrier SMS notes.',
      utilityNode: (
        <div className="inline-block bg-bg-secondary border border-border rounded-lg p-4 font-mono text-xs text-text-secondary shadow-sm max-w-xs">
          <div className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">SMS Inbox</div>
          <div>Voucher: BECE-2026-8941</div>
          <div>PIN: 9012-3456-7110</div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleStepClick = (stepId: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveStep(stepId);
  };

  const getStepState = (stepId: number) => {
    if (stepId < activeStep) return 'completed';
    if (stepId === activeStep) return 'active';
    return 'future';
  };

  const renderStepNode = (step: WizardStepData) => {
    const state = getStepState(step.id);

    if (state === 'completed') {
      return (
        <div className="w-12 h-12 rounded-full bg-[#00A36C] flex items-center justify-center text-white shadow-md flex-shrink-0">
          <CheckCircle2 size={24} />
        </div>
      );
    }

    if (state === 'active') {
      return (
        <div className="w-12 h-12 rounded-full bg-[#346231] flex items-center justify-center text-white font-bold shadow-[0_0_0_4px_rgba(52,98,49,0.25)] flex-shrink-0">
          {step.id}
        </div>
      );
    }

    return (
        <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] font-bold flex-shrink-0">
          {step.id}
      </div>
    );
  };

  const activeStepData = steps.find((s) => s.id === activeStep) || steps[0];

  return (
    <section className="bg-[#F8FAF8] py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="font-mono font-bold text-6xl md:text-8xl lg:text-9xl text-[#346231] leading-none mb-2 select-none">
            *713*5912#
          </div>
          <h2 className="font-heading font-bold text-4xl md:text-5xl text-[#371f0d] mb-4">
            How It Works Via USSD
          </h2>
          <p className="font-sans text-lg text-[#6B7280] max-w-2xl mx-auto">
            No smartphone? No internet? No problem. Buy vouchers directly from your feature phone using our USSD service.
          </p>
        </motion.div>

        <div>
          {/* Progress Track - Nodes ABOVE content */}
          <div className="relative mb-10">
            <div className="absolute top-[24px] left-6 right-6 h-3 bg-[#346231] rounded-full z-0" />
            <div className="relative z-10 flex flex-row items-center justify-between gap-4 overflow-x-auto scrollbar-hide md:justify-center md:gap-0 px-2 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              ` }} />
              <div className="flex flex-row items-center gap-6 md:gap-0 md:justify-between w-full min-w-[640px] md:min-w-0">
                {steps.map((step) => {
                  const state = getStepState(step.id);
                  const isActive = state === 'active';
                  const isCompleted = state === 'completed';

                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepClick(step.id)}
                      className={`flex flex-col items-center gap-3 shrink-0 md:px-8 py-2 transition-colors duration-300 ${
                        isActive ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {renderStepNode(step)}
                        <span
                          className={`text-sm font-sans font-semibold transition-colors duration-300 ${
                            isActive
                              ? 'text-[#346231]'
                              : isCompleted
                              ? 'text-[#00A36C]'
                              : 'text-[#6B7280]'
                          }`}
                        >
                          {step.subLabel}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="h-1 w-8 bg-[#346231] rounded-full"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                      {isCompleted && !isActive && (
                        <div className="h-1 w-8 bg-[#00A36C] rounded-full" />
                      )}
                      {!isActive && !isCompleted && (
                        <div className="h-1 w-8 bg-transparent rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sliding Content Panel */}
          <div className="relative w-full overflow-hidden min-h-[440px] sm:min-h-[360px] md:min-h-[280px] lg:min-h-[220px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeStepData.id}
                initial={{ opacity: 0, translateX: 32 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: 32 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-8 md:p-12 w-full"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#6B7280]">
                        {activeStepData.label}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-[#346231]">
                        {activeStepData.subLabel}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-2xl md:text-3xl text-[#371f0d] mb-4">
                      {activeStepData.title}
                    </h3>
                    <p className="font-sans text-lg text-[#6B7280] leading-relaxed max-w-2xl">
                      {activeStepData.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center bg-[#F8FAF8] rounded-xl p-6 border border-[#E5E7EB]">
                    {activeStepData.utilityNode}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
