'use client';

import { useState } from 'react';
import { X, Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import { submitInquiryApi } from '@/lib/api/inquiries';

const display = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'] });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

interface ContactModalProps {
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  onClose: () => void;
}

export function ContactModal({
  listingId,
  listingTitle,
  landlordId,
  landlordName,
  landlordPhone,
  onClose,
}: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    `Hi, I'm interested in "${listingTitle}" and would like to learn more about it. Please get in touch with me.`,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await submitInquiryApi({ listingId, landlordId, name, email, phone: phone || undefined, message });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  }

  const waLink = landlordPhone
    ? `https://wa.me/${landlordPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${landlordName}, I'm interested in "${listingTitle}".`)}`
    : null;

  const inputCls =
    'w-full border-b border-stone-300 bg-transparent py-2 text-[14px] text-stone-900 placeholder-stone-400 transition focus:border-stone-800 focus:outline-none';
  const labelCls = 'mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Panel */}
      <div className={`${sans.className} relative w-full max-w-md bg-[#f7f6f4] px-6 py-8 sm:px-8 max-h-[90vh] overflow-y-auto`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-stone-400 transition hover:text-stone-900"
        >
          <X className="h-4 w-4" />
        </button>

        {!submitted ? (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">Enquire</p>
            <h2 className={`mt-2 text-2xl font-normal text-stone-900 ${display.className}`}>
              Contact landlord
            </h2>
            <p className="mt-1 truncate text-[13px] text-stone-500">{listingTitle}</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className={labelCls}>Your name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Phone{' '}
                  <span className="font-normal normal-case tracking-normal text-stone-400">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Message</label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full resize-none border-b border-stone-300 bg-transparent py-2 text-[14px] text-stone-900 placeholder-stone-400 transition focus:border-stone-800 focus:outline-none"
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 py-3.5 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#f7f6f4] transition hover:bg-stone-800 disabled:opacity-40"
              >
                {submitting ? 'Sending…' : 'Send inquiry'}
              </button>
            </form>
          </>
        ) : (
          <div className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-stone-400">Sent</p>
                <h2 className={`mt-1 text-2xl font-normal text-stone-900 ${display.className}`}>
                  Inquiry received
                </h2>
              </div>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-stone-600">
              {landlordName} will be in touch at <strong>{email}</strong>
              {phone && <> or <strong>{phone}</strong></>}.
            </p>

            {landlordPhone && (
              <div className="mt-8 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-stone-400">
                  Landlord contact
                </p>
                <a
                  href={`tel:${landlordPhone}`}
                  className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3.5 text-[13px] font-medium text-stone-800 transition hover:border-stone-800"
                >
                  <Phone className="h-4 w-4 shrink-0 text-stone-400" />
                  {landlordPhone}
                </a>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-stone-200 bg-white px-4 py-3.5 text-[13px] font-medium text-stone-800 transition hover:border-stone-800"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
                    WhatsApp
                  </a>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full border border-stone-300 py-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-stone-600 transition hover:border-stone-800 hover:text-stone-900"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
