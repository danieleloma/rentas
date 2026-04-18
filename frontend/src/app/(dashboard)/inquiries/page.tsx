'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MessageSquare } from 'lucide-react';
import { getInquiriesApi } from '@/lib/api/inquiries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/format';

export default function InquiriesPage() {
  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['inquiries'],
    queryFn: getInquiriesApi,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inquiries</h1>
        {inquiries.length > 0 && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {inquiries.length} inquiry{inquiries.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center dark:border-gray-800 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{inquiry.name}</p>
                  {inquiry.listing?.title && (
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      Re: {inquiry.listing.title}
                    </p>
                  )}
                </div>
                <p className="shrink-0 text-xs text-gray-400">{formatDate(inquiry.createdAt)}</p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {inquiry.message}
              </p>

              <div className="mt-4 flex flex-wrap gap-4">
                <a
                  href={`mailto:${inquiry.email}`}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <>
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {inquiry.phone}
                    </a>
                    <a
                      href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
