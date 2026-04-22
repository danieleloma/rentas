'use client';

import Link from 'next/link';
import { Bed, Bath, Maximize, MapPin, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Listing } from '@/types';

interface ListingDetailProps {
  listing: Listing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {listing.images.length > 0 ? (
          listing.images.slice(0, 6).map((img) => (
            <div
              key={img.id}
              className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={img.url}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full flex aspect-[16/9] items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            <p className="text-gray-400 dark:text-gray-500">No photos available</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">{listing.propertyType}</Badge>
            {listing.isFeatured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            {listing.address}, {listing.city}
            {listing.state && `, ${listing.state}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(listing.monthlyRent)}
            <span className="text-base font-normal text-gray-500 dark:text-gray-400">/mo</span>
          </p>
          {listing.deposit && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Deposit: {formatCurrency(listing.deposit)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <Bed className="mx-auto h-6 w-6 text-gray-700 dark:text-gray-300" />
          <p className="mt-2 text-lg font-semibold">{listing.bedrooms}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <Bath className="mx-auto h-6 w-6 text-gray-700 dark:text-gray-300" />
          <p className="mt-2 text-lg font-semibold">{listing.bathrooms ?? '—'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <Maximize className="mx-auto h-6 w-6 text-gray-700 dark:text-gray-300" />
          <p className="mt-2 text-lg font-semibold">
            {listing.squareFootage ? `${listing.squareFootage}` : '—'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sq Ft</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-800 dark:bg-gray-900">
          <Calendar className="mx-auto h-6 w-6 text-gray-700 dark:text-gray-300" />
          <p className="mt-2 text-lg font-semibold">
            {listing.availableFrom ? formatDate(listing.availableFrom) : 'Now'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
        </div>
      </div>

      {listing.description && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
          <p className="mt-2 whitespace-pre-line text-gray-600 dark:text-gray-300">{listing.description}</p>
        </div>
      )}

      {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Amenities</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Listed by</h2>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={listing.landlord.avatarUrl ?? undefined} alt={`${listing.landlord.firstName} ${listing.landlord.lastName}`} />
            <AvatarFallback>{`${listing.landlord.firstName[0] ?? ''}${listing.landlord.lastName[0] ?? ''}`.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {listing.landlord.firstName} {listing.landlord.lastName}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link href="/messages" className="flex-1">
            <Button className="w-full">Contact Landlord</Button>
          </Link>
          <Link href="/visits" className="flex-1">
            <Button variant="outline" className="w-full">Schedule Visit</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
