/** The questions shown on the home page and in its structured-data markup. */
export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const faqs: FAQItem[] = [
  {
    id: 0,
    question: 'Do vouchers expire?',
    answer:
      'No, CivicTree vouchers never expire. You can use your voucher anytime, giving you complete flexibility to study and take your exam at your own pace.',
  },
  {
    id: 1,
    question: 'What if stock runs out?',
    answer:
      'Payment is always accepted. If stock is temporarily low, your voucher delivery may be slightly delayed, but you will receive it. We restock frequently to ensure availability.',
  },
  {
    id: 2,
    question: 'Can I buy multiple vouchers?',
    answer:
      'Yes, absolutely! During checkout, you can select any quantity from 1 to 20 vouchers in a single purchase. Perfect for schools or group purchases.',
  },
  {
    id: 3,
    question: 'What payment methods are accepted?',
    answer:
      'We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, Visa cards, and Mastercard. All payments are processed securely.',
  },
  {
    id: 4,
    question: 'How quickly will I receive my voucher?',
    answer:
      'Instant! Most vouchers are delivered within seconds of payment confirmation via email and SMS. You can start using your voucher immediately.',
  },
  {
    id: 5,
    question: 'What exams are supported?',
    answer:
      'CivicTree currently supports three major Ghanaian exams: BECE (Basic Education Certificate Exam), WASSCE (West African Senior School Certificate Exam), and NOVDEC (National Office for Vocational Education and Training December Exam).',
  },
  {
    id: 6,
    question: 'Is my payment information secure?',
    answer:
      'Yes, all payment information is encrypted and processed through secure payment gateways. We never store credit card details and comply with international security standards.',
  },
];
