import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does the escrow lock and auto-return work?',
      answer:
        'When you fund your deposit with test ETH on Sepolia, the funds are locked in an autonomous smart contract. Neither party can withdraw them during your lease. At move-out, a 14-day countdown starts. If the landlord does not file an itemized claim backed by photo proof within those 14 days, the smart contract automatically returns 100% of the deposit to your wallet.',
    },
    {
      question: 'What makes the photos tamper-evident?',
      answer:
        "All photos must be captured live inside the app with camera device verification. Atomic timestamps, GPS location coordinates, and a digital photo hash are permanently recorded at the exact moment of capture. Uploads from external camera rolls, screenshots, or edited images are completely rejected.",
    },
    {
      question: 'How do itemized claims work?',
      answer:
        'Landlords cannot freeze your entire deposit over small issues. Every deduction must be submitted item by item with clear photo evidence. You can instantly accept undisputed items and receive the rest of your deposit right away, only disputing specific contested claims.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 relative scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-left mb-10 md:mb-12">
          <span className="text-[#10B981] text-xs font-bold block mb-2">
            Faq
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-[#111111] tracking-tight text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#525252] mt-2 max-w-[65ch]">
            Everything you need to know about the rental deposit escrow protocol.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`bg-white rounded-[28px] md:rounded-[32px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#10B981]/40 shadow-[0_8px_30px_rgba(16,185,129,0.06)]'
                    : 'border-black/5 hover:border-black/15 shadow-[0_4px_24px_rgba(0,0,0,0.02)]'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 sm:px-8 py-5 sm:py-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-lg sm:text-xl text-[#111111] tracking-tight">
                    {faq.question}
                  </span>
                  {/* Accordion + / x icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#F7F7F7] text-[#111111] hover:bg-black/5'
                    }`}
                  >
                    {isOpen ? (
                      <X className="w-4 h-4 transition-transform duration-200" />
                    ) : (
                      <Plus className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </div>
                </button>

                {/* Answer drawer */}
                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0 animate-in fade-in duration-200">
                    <div className="pt-2 border-t border-black/5">
                      <p className="text-sm sm:text-base text-[#525252] leading-relaxed max-w-[65ch]">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
