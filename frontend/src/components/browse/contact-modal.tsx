'use client';

import { useState } from 'react';
import { Phone, MessageCircle, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { submitInquiryApi } from '@/lib/api/inquiries';

interface ContactModalProps {
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  landlordPhone?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContactModal({
  listingId,
  listingTitle,
  landlordId,
  landlordName,
  landlordPhone,
  onClose,
  onSuccess,
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
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  }

  const waLink = landlordPhone
    ? `https://wa.me/${landlordPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${landlordName}, I'm interested in "${listingTitle}".`)}`
    : null;

  return (
    <Modal isOpen onClose={onClose} title={submitted ? 'Inquiry received' : 'Contact landlord'}>
      {!submitted ? (
        <>
          <p className="mb-5 truncate text-sm text-muted-foreground">{listingTitle}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <Input
              label="Phone (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium leading-none">Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1.5 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send inquiry'}
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {landlordName} will be in touch at{' '}
              <strong className="text-foreground">{email}</strong>
              {phone && <> or <strong className="text-foreground">{phone}</strong></>}.
            </p>
          </div>

          {landlordPhone && (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Landlord contact
              </p>
              <a
                href={`tel:${landlordPhone}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted/80"
              >
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                {landlordPhone}
              </a>
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 transition hover:bg-green-100"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
                  WhatsApp
                </a>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}
